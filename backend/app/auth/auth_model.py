from pydantic import BaseModel, EmailStr, validator
from typing import Optional

# Schema for user registration
class UserCreate(BaseModel):
    email: EmailStr  # Validated email format
    password: str    # Plain text password to be validated
    full_name: Optional[str] = None  # Optional full name field
    role: str  # Must be one of: Customer, RestaurantManager, or Admin

    # Custom validator for password strength
    @validator('password')
    def password_validation(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        if not any(char in "!@#$%^&*()-_=+[]{}|;:,.<>?/" for char in v):
            raise ValueError("Password must contain at least one special character")
        return v

# Schema for user login
class UserLogin(BaseModel):
    email: EmailStr  
    password: str   
