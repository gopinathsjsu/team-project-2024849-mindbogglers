from pydantic import BaseModel, validator
from datetime import date, time, datetime

class ReservationCreate(BaseModel):
    table_id: int
    date: date
    time: time  # We will convert string to time using a validator
    number_of_people: int

    @validator('time', pre=True)
    def parse_time(cls, value):
        if isinstance(value, time):
            return value
        try:
            return datetime.strptime(value, "%H:%M").time()
        except Exception:
            raise ValueError("Invalid time format. Expected 'HH:MM'")
        
class ReservationRequest(BaseModel):
    reservation_id: int
