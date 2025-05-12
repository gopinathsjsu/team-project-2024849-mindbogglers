from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = "sqlite:///./booktable.db"

# ✅ Add timeout and autocommit isolation level to reduce locking issues
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        "timeout": 30  # ⏱️ Increase wait time before throwing "database is locked"
    },
    isolation_level="AUTOCOMMIT"  # 🔓 Reduce transaction locking
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
