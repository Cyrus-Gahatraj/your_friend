from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from core.database import get_db
from sqlalchemy.orm import Session
from models import models
from schemas import user_schemas
from core import oauth2
from schemas import token_schemas
from core.utils import verify, hash

router = APIRouter(
    tags=['Authentication']
)

@router.post('/log-in', response_model=token_schemas.Token)
def user_login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user  = db.query(models.User).filter(
        models.User.email == user_credentials.username ).first()
    
    if not user:
        raise HTTPException( 
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
    refresh_token = oauth2.create_refresh_token(data={
        'user_id': str(user.id)
    })
    
    return token_schemas.Token(
        access_token = access_token, 
        refresh_token = refresh_token, 
        token_type = "bearer"
    )

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

@router.post("/refresh", response_model=token_schemas.Token)
def refresh_token(req: token_schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = oauth2.verify_refresh_token(req.refresh_token, credentials_exception)
    user = db.query(models.User).filter(models.User.id == token_data.id).first()
    if not user:
        raise credentials_exception

    access_token = oauth2.create_access_token({"user_id": user.id})
    new_refresh_token = oauth2.create_refresh_token({"user_id": user.id})

    return token_schemas.Token(
        access_token = access_token, 
        refresh_token = new_refresh_token, 
        token_type = "bearer"
    )