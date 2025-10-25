from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.ai_chat import AIChatSession
from app.core.database import get_db
from app.models import models

router = APIRouter(prefix="/ai", tags=["AI Chat"])

class ChatRequest(BaseModel):
    user_id: int
    message: str
    persona: str = "Alice"
    session_id: str | None = None


@router.post("/chat")
def chat_with_ai(
    req: ChatRequest,
    db: Session = Depends(get_db)
):
    """Send a message to the AI and return the response."""
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session_id = req.session_id or f"{req.user_id}_{req.persona}"

    chat = AIChatSession(db=db, session_id=session_id, user_id=req.user_id, persona_name=req.persona)
    response = chat.send_message(req.message)

    return {
        "persona": req.persona,
        "session_id": session_id,
        "user_message": response["user_message"],
        "ai_response": response["ai_response"],
        "timestamp": response["timestamp"]
    }


@router.get("/history")
def get_chat_history(
    user_id: int,
    persona: str = "Alice",
    session_id: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve previous messages between user and AI.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not session_id:
        session_id = f"{user_id}_{persona}"

    chat = AIChatSession(db=db, session_id=session_id, user_id=user_id, persona_name=persona)
    history = chat.get_history()
    return {"persona": persona, "session_id": session_id, "history": history}
