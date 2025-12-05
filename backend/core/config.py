import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Polymarket Bot"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "polymarket_bot")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@db:5432/{POSTGRES_DB}")
    
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
