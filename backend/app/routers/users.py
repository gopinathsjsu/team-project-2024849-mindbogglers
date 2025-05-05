# Import necessary modules and components
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import models, database
from app.auth import auth_model, auth_handler
from app.auth.auth_dependency import get_current_user

# Create a router for user-related endpoints
router = APIRouter(prefix="/users", tags=["Users"])

# Dependency to get a database session
def get_db():
    db = database.SessionLocal()  # Create a new database session
    try:
        yield db  # Provide the session to the endpoint
    finally:
        db.close()  # Always close the session after use

# User Registration Endpoint
@router.post("/register")
def register_user(user: auth_model.UserCreate, db: Session = Depends(get_db)):
    # Check if a user with the given email already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Hash the user's password
        hashed_pw = auth_handler.hash_password(user.password)
        
        # Create a new User instance
        new_user = models.User(
            email=user.email,
            hashed_password=hashed_pw,
            full_name=user.full_name,
            role=user.role
        )
        
        # Add the user to the database and save changes
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate access token immediately after registration
        access_token = auth_handler.create_access_token(
            data={"sub": new_user.email, "role": new_user.role}
        )
        
        # Return the token to automatically log in the user
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError as e:
        # Handle password validation errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle any other unexpected errors
        db.rollback()  # Roll back the transaction if an error occurs
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# User Login Endpoint
@router.post("/login")
def login_user(user: auth_model.UserLogin, db: Session = Depends(get_db)):
    # Look up the user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    # Validate the provided password against the stored hashed password
    if not db_user or not auth_handler.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate a JWT access token if credentials are valid
    token = auth_handler.create_access_token(
        data={"sub": db_user.email, "role": db_user.role}
    )

    # Return the token to the user
    return {"access_token": token, "token_type": "bearer"}

# Protected Route: Get Current User Profile
@router.get("/me")
def get_profile(current_user: models.User = Depends(get_current_user)):
    # Return the current authenticated user's profile info
    return {
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role
    }