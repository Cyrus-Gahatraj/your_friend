from datetime import datetime
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session
from app.models import models
from .config import settings
import json, os

GROQ_API_KEY = settings.groq_api_key


class Message(BaseModel):
    current_time: datetime
    text: str


class AIChatSession:
    def __init__(self, db: Session, session_id: str, user_id: int, persona_name: str = "Alice"):
        self.db = db
        self.session_id = session_id
        self.user_id = user_id
        self.persona_name = persona_name

        self.user = db.query(models.User).filter(models.User.id == user_id).first()
        if not self.user:
            raise ValueError(f"User ID {user_id} not found in DB")

        self.ai_user = self._get_or_create_ai_user()

        self.persona = self._load_persona(persona_name)

        self.parser = PydanticOutputParser(pydantic_object=Message)

        self.memory_store = {}

        examples = self.persona.get("example_message", [])
        example_prompt = ChatPromptTemplate.from_messages([
            ("human", "{input}"),
            ("ai", "{output}")
        ])
        few_shot_prompt = FewShotChatMessagePromptTemplate(
            example_prompt=example_prompt,
            examples=examples
        )

        self.pydantic_prompt = ChatPromptTemplate.from_messages([
            ("system", (self.persona.get("system", "")).replace("#USERNAME", self.user.username)),
            few_shot_prompt,
            ("human", "Format={format_instructions}\nTime={time}\nInput={input}")
        ]).partial(
            format_instructions=self.parser.get_format_instructions(),
            time=datetime.now()
        )

        self.chat_model = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.8,
            api_key=GROQ_API_KEY
        )

        self.model_with_memory = RunnableWithMessageHistory(
            self.chat_model,
            lambda: self._get_session_history(self.session_id)
        )

        self.memory_chain = self.pydantic_prompt | self._to_messages | self.model_with_memory | self.parser

    def _get_or_create_ai_user(self):
        """Get or create the AI system user"""
        ai_user = self.db.query(models.User).filter(models.User.username == "AI_System").first()
        if not ai_user:
            ai_user = models.User(
                username="AI_System",
                email="ai_system@yourapp.com",
                country="AI",
                password="",  
                is_active=True
            )
            self.db.add(ai_user)
            self.db.commit()
            self.db.refresh(ai_user)
            print(f"Created AI system user with ID: {ai_user.id}")
        else:
            print(f"Using existing AI system user with ID: {ai_user.id}")
        return ai_user

    def _load_persona(self, name: str):
        path = os.path.join("app", "personas", f"{name.lower()}.json")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Persona JSON not found at: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _get_session_history(self, session_id: str):
        """Get chat memory for this session"""
        if session_id not in self.memory_store:
            self.memory_store[session_id] = InMemoryChatMessageHistory()
        return self.memory_store[session_id]

    def _to_messages(self, chat_prompt_value):
        """Ensure the Groq model receives proper BaseMessage[] list"""
        return chat_prompt_value.messages if hasattr(chat_prompt_value, "messages") else chat_prompt_value

    def _save_message(self, sender_id, receiver_id, content, is_ai=False):
        """Save message in DB"""
        msg = models.Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=content,
            timestamp=datetime.utcnow(),
            is_ai=is_ai
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def _load_recent_messages(self, limit=10):
        """Fetch recent messages for user"""
        return (
            self.db.query(models.Message)
            .filter(
                (models.Message.sender_id == self.user_id) |
                (models.Message.receiver_id == self.user_id)
            )
            .order_by(models.Message.timestamp.desc())
            .limit(limit)
            .all()
        )

    def send_message(self, user_input: str):
        """Send user message, get AI response, save both"""
        user_msg = self._save_message(
            sender_id=self.user_id,
            receiver_id=self.ai_user.id,
            content=user_input,
            is_ai=False
        )

        config = {"configurable": {"session_id": self.session_id}}
        response = self.memory_chain.invoke({"input": user_input}, config=config)

        ai_msg = self._save_message(
            sender_id=self.ai_user.id,
            receiver_id=self.user_id,
            content=response.text,
            is_ai=True
        )

        return {
            "user_message": user_msg.content,
            "ai_response": ai_msg.content,
            "timestamp": ai_msg.timestamp
        }

    def get_history(self, limit=20):
        """Return recent chat history"""
        msgs = self._load_recent_messages(limit)
        return [
            {
                "id": m.id,
                "from": "AI" if m.is_ai else self.user.username,
                "content": m.content,
                "timestamp": m.timestamp.isoformat()
            }
            for m in reversed(msgs)
        ]