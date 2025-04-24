from fastapi import FastAPI
from app.db import models
from app.db.database import Base, engine
from app.routers import users, restaurants, restaurant_manager, admin  # Add new routers
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="BookTable API",
    description="End-to-End Restaurant Reservation Backend",
    version="1.0.0"
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(restaurant_manager.router)  
app.include_router(admin.router)  

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to BookTable API 🎉"}

# Then add the middleware to your app:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)