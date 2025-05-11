from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db import models, database
from app.auth.auth_handler import SECRET_KEY, ALGORITHM

# Dependency to extract the token from the "Authorization" header
api_key_header = APIKeyHeader(name="Authorization", auto_error=True)

# Dependency that provides a database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to validate a JWT token and return the corresponding user
def get_current_user(token: str = Depends(api_key_header), db: Session = Depends(get_db)):
    # Exception raised when credentials are invalid or missing
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Debug print of raw Authorization header
        print("\nRaw Authorization Header:", token)

        # Ensure token starts with "Bearer " prefix
        if not token.startswith("Bearer "):
            print("Token missing 'Bearer ' prefix")
            raise credentials_exception

        # Extract JWT from the header value
        jwt_token = token.split(" ")[1]

        # Decode JWT using secret key and algorithm
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded JWT Payload:", payload)

        # Extract email (sub) and role from payload
        email: str = payload.get("sub")
        role: str = payload.get("role")

        # Log the user lookup attempt
        print("Looking up user with email:", email)

        # Validate presence of required payload fields
        if email is None or role is None:
            print("Missing 'sub' or 'role' in payload")
            raise credentials_exception

    except JWTError as e:
        # Log any JWT decoding errors and raise unauthorized exception
        print("JWT Decode Error:", str(e))
        raise credentials_exception

    # Query database for user by email
    user = db.query(models.User).filter(models.User.email == email).first()

    # Raise exception if user not found
    if user is None:
        print("No user found in DB with email:", email)
        raise credentials_exception

    # Successfully authenticated user
    print("Authenticated User:", user.email)
    return user
