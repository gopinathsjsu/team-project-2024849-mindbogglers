from pydantic import BaseModel
from datetime import date, time

class ReservationCreate(BaseModel):
    table_id: int
    date: date
    time: time
    number_of_people: int
