from fastapi import FastAPI
from app.routers import auth
from app.core.database import init_db

init_db()
app = FastAPI()

app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "👋 Welcome to Your Friend!"}