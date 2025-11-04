from typing import List
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from models import models
from sqlalchemy.orm import Session


def get_session_history(
    session_id: str, db: Session, user_id: int, ai_user_id: int
) -> "DBChatMessageHistory":
    return DBChatMessageHistory(
        session_id=session_id, db=db, user_id=user_id, ai_user_id=ai_user_id
    )

class DBChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id: str, db: Session, user_id: int, ai_user_id: int):
        self.session_id = session_id
        self.db = db
        self.user_id = user_id
        self.ai_user_id = ai_user_id

    @property
    def messages(self) -> List[BaseMessage]:
        """Retrieve messages from the database."""
        db_messages = (
            self.db.query(models.Message)
            .filter(
                (
                    (models.Message.sender_id == self.user_id)
                    & (models.Message.receiver_id == self.ai_user_id)
                )
                | (
                    (models.Message.sender_id == self.ai_user_id)
                    & (models.Message.receiver_id == self.user_id)
                )
            )
            .order_by(models.Message.timestamp.asc())
            .all()
        )

        filtered_messages = []
        for msg in db_messages:
            # If message has session_id metadata, only include if it matches
            if msg.meta_data and isinstance(msg.meta_data, dict):
                if msg.meta_data.get("session_id") == self.session_id:
                    filtered_messages.append(msg)
                    
        result = []
        for msg in filtered_messages:
            if msg.is_ai:
                result.append(AIMessage(content=msg.content, id=str(msg.id)))
            else:
                result.append(HumanMessage(content=msg.content, id=str(msg.id)))
        return result

    def add_message(self, message: BaseMessage) -> None:
        """Add a message to the database."""
        if isinstance(message, HumanMessage):
            sender_id = self.user_id
            receiver_id = self.ai_user_id
            is_ai = False
        elif isinstance(message, AIMessage):
            sender_id = self.ai_user_id
            receiver_id = self.user_id
            is_ai = True
        else:
            return

        db_message = models.Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=message.content,
            is_ai=is_ai,
            meta_data={"session_id": self.session_id}
        )
        self.db.add(db_message)
        self.db.commit()

    def clear(self) -> None:
        """Clear all messages from the database for this session."""
        messages_to_delete = (
            self.db.query(models.Message)
            .filter(
                (
                    (models.Message.sender_id == self.user_id)
                    & (models.Message.receiver_id == self.ai_user_id)
                )
                | (
                    (models.Message.sender_id == self.ai_user_id)
                    & (models.Message.receiver_id == self.user_id)
                )
            )
            .all()
        )
        for msg in messages_to_delete:
            if msg.meta_data and isinstance(msg.meta_data, dict):
                if msg.meta_data.get("session_id") == self.session_id:
                    self.db.delete(msg)
                    
        self.db.commit()
