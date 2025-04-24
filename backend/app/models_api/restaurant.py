from pydantic import BaseModel
from typing import List, Optional

class RestaurantCreate(BaseModel):
    name: str
    cuisine: str
    cost_rating: int
    city: str
    state: str
    zip_code: str
    rating: float = 0.0

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    cuisine: Optional[str] = None
    cost_rating: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class TableCreate(BaseModel):
    size: int
    available_times: List[str]

class TableUpdate(BaseModel):
    size: Optional[int] = None
    available_times: Optional[List[str]] = None