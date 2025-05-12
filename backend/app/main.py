from fastapi import FastAPI
from app.db import models
from app.db.database import Base, engine
from app.routers import users, restaurants, restaurant_manager, admin, debug
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="BookTable API",
    description="End-to-End Restaurant Reservation Backend",
    version="1.0.0"
)

# ✅ CORS middleware - place this early
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",              # Dev
        "https://yourdomain.com"              # Replace with prod domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Static files for images
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Create tables
models.Base.metadata.create_all(bind=engine)

# ✅ Include routers
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(restaurant_manager.router)
app.include_router(admin.router)
app.include_router(debug.router)

# ✅ Optional seeding
@app.on_event("startup")
def startup_event():
    from app.db.seed_data import seed_restaurants_tables_reviews
    seed_restaurants_tables_reviews()

@app.get("/")
def read_root():
    return {"message": "Welcome to BookTable API 🎉"}
