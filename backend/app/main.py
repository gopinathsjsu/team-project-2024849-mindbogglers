# app/main.py

from fastapi import FastAPI
from app.db import models
from app.db.database import engine
from app.routers import users, restaurants  # ✅ Include user and restaurant routes

app = FastAPI(
    title="BookTable API",
    description="End-to-End Restaurant Reservation Backend",
    version="1.0.0"
)

# ✅ Create database tables
models.Base.metadata.create_all(bind=engine)

# ✅ Register routers
app.include_router(users.router)
app.include_router(restaurants.router)

# ✅ Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to BookTable API 🎉"}
