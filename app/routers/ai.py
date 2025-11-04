from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from core.ai_chat import AIChatSession
from core.database import get_db
from core import oauth2
from models import models
from schemas import query_schemas

router = APIRouter(prefix="/ai", tags=["AI Chat"])


@router.post("/chat", response_model=query_schemas.RespondQuery)
def chat_with_ai(
    req: query_schemas.ChatQuery,
    custom_persona_id: int = Query(
        None, description="ID of custom persona to use instead of default persona"
    ),
    current_user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message to the AI and return the response."""
    print("OK")
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine session ID and persona name
    if custom_persona_id:
        # Verify custom persona belongs to user
        custom_persona = (
            db.query(models.CustomPersona)
            .filter(
                and_(
                    models.CustomPersona.id == custom_persona_id,
                    models.CustomPersona.user_id == current_user.id,
                    models.CustomPersona.is_active == True,
                )
            )
            .first()
        )

        if not custom_persona:
            raise HTTPException(
                status_code=404, detail="Custom persona not found or not accessible"
            )

        session_id = f"{current_user.id}_custom_{custom_persona_id}"
        persona_name = custom_persona.name
    else:
        session_id = f"{current_user.id}_{req.persona}"
        persona_name = req.persona

    chat = AIChatSession(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        persona_name=persona_name,
        custom_persona_id=custom_persona_id,
    )
    response = chat.send_message(req.message)

    return query_schemas.RespondQuery(
        persona=persona_name,
        session_id=session_id,
        user_message=response["user_message"],
        ai_response=response["ai_response"],
        timestamp=response["timestamp"],
    )
    

@router.get("/history", response_model=query_schemas.HistoryQuery)
def get_chat_history(
    persona: str = Query(None, description="Default persona name"),
    custom_persona_id: int = Query(None, description="ID of custom persona"),
    current_user=Depends(oauth2.get_current_user),
    session_id: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieve previous messages between user and AI.
    Use either persona (for default) or custom_persona_id (for custom personas).
    """
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine session ID and persona name
    if custom_persona_id:
        # Verify custom persona belongs to user
        custom_persona = (
            db.query(models.CustomPersona)
            .filter(
                and_(
                    models.CustomPersona.id == custom_persona_id,
                    models.CustomPersona.user_id == current_user.id,
                    models.CustomPersona.is_active == True,
                )
            )
            .first()
        )
        
        if not custom_persona:
            raise HTTPException(
                status_code=404, detail="Custom persona not found or not accessible"
            )

        if not session_id:
            session_id = f"{current_user.id}_custom_{custom_persona_id}"
        persona_name = custom_persona.name
    else:
        if not persona:
            raise HTTPException(
                status_code=400,
                detail="Either persona or custom_persona_id must be provided",
            )

        if not session_id:
            session_id = f"{current_user.id}_{persona}"
        persona_name = persona

    chat = AIChatSession(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        persona_name=persona_name,
        custom_persona_id=custom_persona_id,
    )
    history = chat.get_history()
    return query_schemas.HistoryQuery(
        persona=persona_name, session_id=session_id, history=history
    )