from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from core.database import get_db
from core import oauth2
from models import models
from schemas import persona_schemas

router = APIRouter(prefix="/personas", tags=["Custom Personas"])


@router.post(
    "/",
    response_model=persona_schemas.PersonaResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_custom_persona(
    persona: persona_schemas.PersonaCreate,
    current_user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new custom AI persona for the authenticated user."""

    # Check if user already has a persona with this name
    existing_persona = (
        db.query(models.CustomPersona)
        .filter(
            and_(
                models.CustomPersona.user_id == current_user.id,
                models.CustomPersona.name.ilike(persona.name),
                models.CustomPersona.is_active == True,
            )
        )
        .first()
    )

    if existing_persona:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have an active persona named '{persona.name}'",
        )

    # Check persona limit per user (optional - can be configured)
    persona_count = (
        db.query(models.CustomPersona)
        .filter(
            and_(
                models.CustomPersona.user_id == current_user.id,
                models.CustomPersona.is_active == True,
            )
        )
        .count()
    )

    if persona_count >= 10:  # Limit to 10 custom personas per user
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum number of custom personas reached (10). Please delete some to create new ones.",
        )

    # Convert example messages to dict format for JSON storage
    example_messages_dict = []
    if persona.example_messages:
        example_messages_dict = [
            {"input": msg.input, "output": msg.output}
            for msg in persona.example_messages
        ]

    # Create new custom persona
    db_persona = models.CustomPersona(
        user_id=current_user.id,
        name=persona.name,
        system_prompt=persona.system_prompt,
        example_messages=example_messages_dict,
        avatar_url=persona.avatar_url,
        description=persona.description,
    )

    db.add(db_persona)
    db.commit()
    db.refresh(db_persona)

    return db_persona


@router.get("/", response_model=persona_schemas.PersonaListResponse)
def list_custom_personas(
    current_user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
    include_inactive: bool = False,
):
    """Get all custom personas for the authenticated user."""

    query = db.query(models.CustomPersona).filter(
        models.CustomPersona.user_id == current_user.id
    )

    if not include_inactive:
        query = query.filter(models.CustomPersona.is_active == True)

    personas = query.order_by(models.CustomPersona.created_at.desc()).all()

    return persona_schemas.PersonaListResponse(personas=personas, total=len(personas))


@router.get("/{persona_id}", response_model=persona_schemas.PersonaResponse)
def get_custom_persona(
    persona_id: int,
    current_user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific custom persona by ID (only for the authenticated user)."""

    persona = (
        db.query(models.CustomPersona)
        .filter(
            and_(
                models.CustomPersona.id == persona_id,
                models.CustomPersona.user_id == current_user.id,
            )
        )
        .first()
    )

    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Custom persona not found"
        )

    return persona


@router.put("/{persona_id}", response_model=persona_schemas.PersonaResponse)
def update_custom_persona(
    persona_id: int,
    persona_update: persona_schemas.PersonaUpdate,
    current_user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    """Update a specific custom persona (only for the authenticated user)."""

    # Find the persona and ensure it belongs to the current user
    db_persona = (
        db.query(models.CustomPersona)
        .filter(
            and_(
                models.CustomPersona.id == persona_id,
                models.CustomPersona.user_id == current_user.id,
            )
        )
        .first()
    )

    if not db_persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Custom persona not found"
        )

    # Check for name conflicts if name is being updated
    if persona_update.name and persona_update.name != db_persona.name:
        existing_persona = (
            db.query(models.CustomPersona)
            .filter(
                and_(
                    models.CustomPersona.user_id == current_user.id,
                    models.CustomPersona.name.ilike(persona_update.name),
                    models.CustomPersona.is_active == True,
                    models.CustomPersona.id != persona_id,
                )
            )
            .first()
        )

        if existing_persona:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You already have an active persona named '{persona_update.name}'",
            )

    # Update fields
    update_data = persona_update.dict(exclude_unset=True)

    # Handle example messages conversion
    if (
        "example_messages" in update_data
        and update_data["example_messages"] is not None
    ):
        example_messages_dict = [
            {"input": msg["input"], "output": msg["output"]}
            for msg in update_data["example_messages"]
        ]
        update_data["example_messages"] = example_messages_dict

    for field, value in update_data.items():
        setattr(db_persona, field, value)

    db.commit()
    db.refresh(db_persona)

    return db_persona


@router.delete("/{persona_id}", response_model=persona_schemas.PersonaDeleteResponse)
def delete_custom_persona(
    persona_id: int,
    current_user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a specific custom persona (only for the authenticated user)."""

    # Find the persona and ensure it belongs to the current user
    db_persona = (
        db.query(models.CustomPersona)
        .filter(
            and_(
                models.CustomPersona.id == persona_id,
                models.CustomPersona.user_id == current_user.id,
            )
        )
        .first()
    )

    if not db_persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Custom persona not found"
        )

    # Soft delete by setting is_active to False
    db_persona.is_active = False
    db.commit()

    return persona_schemas.PersonaDeleteResponse(
        message=f"Custom persona '{db_persona.name}' has been deleted",
        deleted_persona_id=persona_id,
    )


@router.post("/{persona_id}/activate", response_model=persona_schemas.PersonaResponse)
def activate_custom_persona(
    persona_id: int,
    current_user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    """Reactivate a previously deleted custom persona."""

    db_persona = (
        db.query(models.CustomPersona)
        .filter(
            and_(
                models.CustomPersona.id == persona_id,
                models.CustomPersona.user_id == current_user.id,
            )
        )
        .first()
    )

    if not db_persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Custom persona not found"
        )

    if db_persona.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Persona is already active"
        )

    # Check for name conflicts
    existing_persona = (
        db.query(models.CustomPersona)
        .filter(
            and_(
                models.CustomPersona.user_id == current_user.id,
                models.CustomPersona.name.ilike(db_persona.name),
                models.CustomPersona.is_active == True,
                models.CustomPersona.id != persona_id,
            )
        )
        .first()
    )

    if existing_persona:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have an active persona named '{db_persona.name}'",
        )

    db_persona.is_active = True
    db.commit()
    db.refresh(db_persona)

    return db_persona
