from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import os

def get_database_url():

    if os.getenv("DATABASE_URL"):
        return os.getenv("DATABASE_URL")
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        postgres_user = os.getenv('POSTGRES_USER')
        postgres_password = os.getenv('POSTGRES_PASSWORD')
        postgres_db = os.getenv('POSTGRES_DB')
        postgres_host = os.getenv("POSTGRES_HOST", "localhost")
        if os.getenv("DOCKER_ENV", "false").lower() == "true":
            postgres_host = "db"
        port = 5432
        db_url = f'postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{port}/{postgres_db}'
        return db_url
    except ImportError:
        raise ValueError('dotenv is not available.')
    except Exception as e:
        raise ValueError('Database configuration error:', e)

engine = create_engine(get_database_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
