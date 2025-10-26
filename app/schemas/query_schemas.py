from pydantic import BaseModel
from  datetime import datetime
from typing import Optional, List

class ChatQuery(BaseModel):
    message: str
    persona: str 

class RespondQuery(BaseModel):
    persona: str
    session_id: str
    user_message: str
    ai_response: str
    timestamp: datetime

class HistoryQuery(BaseModel):
    persona: str
    session_id: str
    history: List[dict]