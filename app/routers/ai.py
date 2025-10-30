from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.ai_chat import AIChatSession
from core.database import get_db
from core import oauth2
from models import models
from schemas import query_schemas

router = APIRouter(prefix="/ai", tags=["AI Chat"])

@router.post("/chat", response_model=query_schemas.RespondQuery)
def chat_with_ai(
    req: query_schemas.ChatQuery,
    current_user = Depends(oauth2.get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the AI and return the response."""
    print('OK')
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session_id =  f"{current_user.id}_{req.persona}"
    chat = AIChatSession(db=db, session_id=session_id, user_id=current_user.id, persona_name=req.persona)
    response = chat.send_message(req.message)

    return query_schemas.RespondQuery(
        persona = req.persona,
        session_id = session_id,
        user_message = response["user_message"],
        ai_response = response["ai_response"],
        timestamp = response["timestamp"]
    )


@router.get("/history", response_model=query_schemas.HistoryQuery)
def get_chat_history(
    persona: str,
    current_user = Depends(oauth2.get_current_user),
    session_id: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve previous messages between user and AI.
    """
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not session_id:
        session_id = f"{current_user.id}_{persona}"

    chat = AIChatSession(db=db, session_id=session_id, user_id=current_user.id, persona_name=persona)
    history = chat.get_history()
    return query_schemas.HistoryQuery(
        persona= persona, 
        session_id = session_id, 
        history = history
    )
