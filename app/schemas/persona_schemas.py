from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List, Dict, Any
import re


class ExampleMessage(BaseModel):
    input: str = Field(..., min_length=1, max_length=500)
    output: str = Field(..., min_length=1, max_length=1000)


class PersonaCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    system_prompt: str = Field(..., min_length=10, max_length=2000)
    example_messages: Optional[List[ExampleMessage]] = []
    avatar_url: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)

    @validator("name")
    def validate_name(cls, v):
        if not re.match(r"^[a-zA-Z0-9\s\-_]+$", v):
            raise ValueError(
                "Name can only contain letters, numbers, spaces, hyphens, and underscores"
            )
        return v.strip()

    @validator("system_prompt")
    def validate_system_prompt(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("System prompt must be at least 10 characters long")
        return v.strip()
        
    @validator("description")
    def validate_description(cls, v):
        if v is None or v == "":
            return None
        return v.strip()

    @validator("avatar_url")
    def validate_avatar_url(cls, v):
        if v is None or v == "":
            return None
        if not (
            v.startswith("http://") or v.startswith("https://") or v.startswith("/")
        ):
            raise ValueError("Avatar URL must be a valid URL or path starting with /")
        return v

    @validator("example_messages")
    def validate_example_messages(cls, v):
        if v and len(v) > 20:
            raise ValueError("Maximum 20 example messages allowed")
        return v


class PersonaUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    system_prompt: Optional[str] = Field(None, min_length=10, max_length=2000)
    example_messages: Optional[List[ExampleMessage]] = None
    avatar_url: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None

    @validator("name")
    def validate_name(cls, v):
        if v is not None:
            if not re.match(r"^[a-zA-Z0-9\s\-_]+$", v):
                raise ValueError(
                    "Name can only contain letters, numbers, spaces, hyphens, and underscores"
                )
            return v.strip()
        return v

    @validator("system_prompt")
    def validate_system_prompt(cls, v):
        if v is not None and len(v.strip()) < 10:
            raise ValueError("System prompt must be at least 10 characters long")
        return v.strip() if v else None
        
    @validator("description")
    def validate_description(cls, v):
        if v is None or v == "":
            return None
        return v.strip() if v else None

    @validator("avatar_url")
    def validate_avatar_url(cls, v):
        if v is None or v == "":
            return None
        if not (
            v.startswith("http://") or v.startswith("https://") or v.startswith("/")
        ):
            raise ValueError("Avatar URL must be a valid URL or path starting with /")
        return v

    @validator("example_messages")
    def validate_example_messages(cls, v):
        if v and len(v) > 20:
            raise ValueError("Maximum 20 example messages allowed")
        return v


class PersonaResponse(BaseModel):
    id: int
    user_id: int
    name: str
    system_prompt: str
    example_messages: List[Dict[str, Any]] = []
    avatar_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PersonaListItem(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PersonaListResponse(BaseModel):
    personas: List[PersonaListItem]
    total: int


class PersonaDeleteResponse(BaseModel):
    message: str
    deleted_persona_id: int
