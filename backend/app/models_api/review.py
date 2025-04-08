from pydantic import BaseModel, Field
from typing import Optional

class ReviewCreate(BaseModel):
    restaurant_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    user_name: str
    rating: int
    comment: Optional[str]

    class Config:
        orm_mode = True
