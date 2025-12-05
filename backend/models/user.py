from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from backend.db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)
    is_allowed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
