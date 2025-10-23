from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models import models
from app.schemas import user_schemas
from app.core import oauth2
from app.schemas import token_schemas
from app.core.utils import verify, hash

router = APIRouter(
    tags=['Authentication']
)

@router.post('/log-in', response_model=token_schemas.Token)
def user_login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user  = db.query(models.User).filter(
        models.User.email == user_credentials.username ).first()
    
    if not user:
        return HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail='Invalid credential.'
        )

    try:
        if not verify(user_credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid Credentials"
            )
    except Exception as e:
        print(f"Password verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error"
        )
    
    access_token = oauth2.create_access_token(data={
         'user_id': str(user.id)
        })
    
    return {'access_token': access_token, 'token_type': 'bearer'}

@router.post('/sign-up', status_code=status.HTTP_201_CREATED, response_model=user_schemas.UserBase)
def create_user(user: user_schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    
    hashed_password = hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        country=user.country,
        password=hashed_password  
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user