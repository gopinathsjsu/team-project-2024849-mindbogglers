from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str  # Customer | RestaurantManager | Admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str
