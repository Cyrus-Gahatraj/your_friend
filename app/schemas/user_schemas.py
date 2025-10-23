from pydantic import BaseModel, EmailStr,  ConfigDict

class UserBase(BaseModel):
    id: int
    email: EmailStr
    username: str
    country: str

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    country: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str