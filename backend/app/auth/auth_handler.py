from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# Password hashing context using bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Constants for JWT encoding/decoding
SECRET_KEY = "secret_booktable"  # Ensure this is consistent across auth-related files
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hash a plaintext password using bcrypt
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verify a plaintext password against a hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Create a JWT access token with an expiration time
def create_access_token(data: dict, expires_delta: timedelta = None):
    # Copy the data to be encoded in the token
    to_encode = data.copy()
    
    # Set token expiration; use default if not provided
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    # Encode the token using the secret key and algorithm
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
