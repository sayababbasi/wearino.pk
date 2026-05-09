from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# If user forgot sslmode, append it (Supabase requires SSL)
if DATABASE_URL and "sslmode" not in DATABASE_URL.lower():
    if "?" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL + "&sslmode=require"
    else:
        DATABASE_URL = DATABASE_URL + "?sslmode=require"

Base = declarative_base()
engine = None
SessionLocal = None

# Try to create engine (safe). If it fails we set SessionLocal = None so app can fallback.
try:
    if DATABASE_URL:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"sslmode": "require"}
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print("[database] Engine created successfully.")
    else:
        print("[database] DATABASE_URL not set in .env; DB disabled.")
except Exception as e:
    print("[database] Failed to create engine:", e)
    engine = None
    SessionLocal = None


def get_db():
    """
    FastAPI dependency. Yields a DB session or None if DB not available.
    Use like: db = Depends(get_db)
    """
    if SessionLocal is None:
        # DB not configured or failed - yield None and return
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
