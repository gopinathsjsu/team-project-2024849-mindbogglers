from databases import Database
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "postgresql://user:password@localhost/booktable_db"

database = Database(DATABASE_URL)
engine = create_engine(DATABASE_URL)
metadata = MetaData()

Base = declarative_base(metadata=metadata)
