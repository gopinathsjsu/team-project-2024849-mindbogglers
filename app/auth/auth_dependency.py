from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db import models, database
from app.auth.auth_handler import SECRET_KEY, ALGORITHM

# Extract token from Authorization header
api_key_header = APIKeyHeader(name="Authorization", auto_error=True)

# Database dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Validate JWT and return current user
def get_current_user(token: str = Depends(api_key_header), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        print("\n🧪 Raw Authorization Header:", token)

        if not token.startswith("Bearer "):
            print("❌ Token missing 'Bearer ' prefix")
            raise credentials_exception

        jwt_token = token.split(" ")[1]
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        print("✅ Decoded JWT Payload:", payload)

        email: str = payload.get("sub")
        role: str = payload.get("role")

        print("🔎 Looking up user with email:", email)

        if email is None or role is None:
            print("❌ Missing 'sub' or 'role' in payload")
            raise credentials_exception

    except JWTError as e:
        print("❌ JWT Decode Error:", str(e))
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        print("❌ No user found in DB with email:", email)
        raise credentials_exception

    print("✅ Authenticated User:", user.email)
    return user
