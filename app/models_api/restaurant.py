from pydantic import BaseModel, Field

class RestaurantCreate(BaseModel):
    name: str
    cuisine: str
    cost_rating: int = Field(..., ge=1, le=5)
    city: str
    state: str
    zip_code: str
    rating: float = Field(..., ge=0, le=5)
