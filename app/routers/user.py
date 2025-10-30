from fastapi import  HTTPException, status, Depends, APIRouter
from models import models
from schemas import user_schemas
from core.database import get_db
from sqlalchemy.orm import Session
from core.oauth2 import get_current_user

router = APIRouter(
    prefix='/users',
    tags=['Users']
)

@router.get('/me', response_model=user_schemas.UserBase)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return current_user


@router.get('/{id}', response_model=user_schemas.UserBase)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'user with {id} not found'
        )
    return user