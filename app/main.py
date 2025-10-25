from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from app.core.database import init_db

init_db()
app = FastAPI()

origins = [
    'http://127.0.0.1:8000',
    'http://localhost:5173'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   
    allow_credentials=True,
    allow_methods=['*'],   
    allow_headers=['*']  
)

app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "👋 Welcome to Your Friend!"}