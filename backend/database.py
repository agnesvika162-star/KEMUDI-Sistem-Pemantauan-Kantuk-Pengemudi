# IMPORT DEPENDENCIES
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime
)
from sqlalchemy.sql import text
from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
    Session
)
from dotenv import load_dotenv
from passlib.context import CryptContext
import os

#===================================================================================================================================
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
Base.metadata.create_all(bind=engine)

# PASSWORD HASH
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

# DATABASE SESSION
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
