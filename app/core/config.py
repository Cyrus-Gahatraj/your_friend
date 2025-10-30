from pydantic_settings import BaseSettings
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent  
ENV_PATH = os.path.join(BASE_DIR.parent, '.env')

class Settings(BaseSettings):
    postgres_db: str
    postgres_user: str 
    postgres_password: str 
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    groq_api_key: str

    class Config:
        env_file = ENV_PATH

settings = Settings()