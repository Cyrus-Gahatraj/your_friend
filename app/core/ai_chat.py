from datetime import datetime
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session
from app.models import models
from .config import settings
from .history import get_session_history
import json, os
import chromadb
from langchain_core.messages import AIMessage, HumanMessage

GROQ_API_KEY = settings.groq_api_key
embedding_model = SentenceTransformer('intfloat/e5-small-v2')

VECTOR_STORE_DIR = os.path.abspath("./vector_store")
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

chroma_client = chromadb.PersistentClient(path=VECTOR_STORE_DIR)
chat_collection = chroma_client.get_or_create_collection(name="chat_memory")

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

        examples = self.persona.get("example_message", [])
        example_prompt = ChatPromptTemplate.from_messages([
            ("human", "{input}"),
            ("ai", "{output}")
        ])
        few_shot_prompt = FewShotChatMessagePromptTemplate(
            example_prompt=example_prompt,
            examples=examples
        )

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", f"""
            {self.persona.get("system", "").replace("#USERNAME", self.user.username)}
            
            You are {persona_name} talking to {self.user.username}. 
            Current time: {datetime.now()}
            
            IMPORTANT: Respond naturally in conversation. Do NOT use JSON format.
            Use your personality and remember previous conversations.
            """),
            few_shot_prompt,
            ("human", "{input}")
        ])

        self.chat_model = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.8,
            api_key=GROQ_API_KEY
        )

        base_chain = self.prompt | self.chat_model | StrOutputParser()

        self.chain = RunnableWithMessageHistory(
            base_chain,
            lambda session_id: get_session_history(
                session_id, self.db, self.user_id, self.ai_user.id
            ),
            input_messages_key="input",
            history_messages_key="history",
        )

    def _get_or_create_ai_user(self):
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
        return ai_user

    def _load_persona(self, name: str):
        path = os.path.join("app", "personas", f"{name.lower()}.json")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Persona JSON not found at: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _embed_and_store(self, message_id: str, text: str, metadata: dict):
        """Create vector embedding and store persistently in ChromaDB"""
        try:
            vector = embedding_model.encode(text).tolist()
            chat_collection.add(
                documents=[text],
                embeddings=[vector],
                metadatas=[{
                    **metadata,
                    "timestamp": datetime.utcnow().isoformat(),
                    "user_id": self.user_id
                }],
                ids=[message_id]
            )
        except Exception as e:
            print(f"Error storing in vector DB: {e}")

    def _search_relevant_messages(self, query_text: str, top_k=3):
        """Find similar messages using ChromaDB"""
        try:
            query_vector = embedding_model.encode(query_text).tolist()
            results = chat_collection.query(
                query_embeddings=[query_vector],
                n_results=top_k,
                where={"session_id": self.session_id},
                include=["documents", "metadatas"]
            )
            
            if results and "documents" in results and results["documents"][0]:
                relevant_docs = []
                for doc, metadata in zip(results["documents"][0], results["metadatas"][0]):
                    role = metadata.get('role', 'user')
                    relevant_docs.append(f"{role}: {doc}")
                return relevant_docs
            return []
        except Exception as e:
            print(f"Error searching relevant messages: {e}")
            return []

    def send_message(self, user_input: str):
        """Send message, get AI response, and automatically store history."""
        context_messages = self._search_relevant_messages(user_input)
        
        enhanced_input = user_input
        if context_messages:
            context_text = "\n".join(context_messages[-2:])
            enhanced_input = f"Previous context:\n{context_text}\n\nCurrent message: {user_input}"

        try:
            config = {"configurable": {"session_id": self.session_id}}
            ai_response_text = self.chain.invoke({"input": enhanced_input}, config=config)
            print(f"✅ AI Response: {ai_response_text}")
            
        except Exception as e:
            print(f"Error in AI chain: {e}")
            ai_response_text = f"Oh, that's an interesting question! I'm not sure how to answer that yet. Let's talk about something else!"

        history = get_session_history(self.session_id, self.db, self.user_id, self.ai_user.id)
        user_msg_db = history.messages[-2]
        ai_msg_db = history.messages[-1]

        self._embed_and_store(
            str(user_msg_db.id),
            user_input,
            {"role": "user", "session_id": self.session_id, "persona": self.persona_name}
        )
        self._embed_and_store(
            str(ai_msg_db.id),
            ai_response_text,
            {"role": "ai", "session_id": self.session_id, "persona": self.persona_name}
        )

        return {
            "user_message": user_input,
            "ai_response": ai_response_text,
            "timestamp": datetime.utcnow().isoformat()
        }

    def get_history(self, limit=20):
        """Retrieves chat history from the database."""
        history = get_session_history(self.session_id, self.db, self.user_id, self.ai_user.id)
        messages = history.messages[-limit:]
        
        formatted_messages = []
        for msg in messages:
            role = "AI" if isinstance(msg, AIMessage) else self.user.username
            # The id is now a string, so we don't need to call str() on it
            formatted_messages.append({
                "id": msg.id,
                "from": role,
                "content": msg.content,
                "timestamp": datetime.utcnow().isoformat() # Timestamps from DB would be better
            })
        return formatted_messages