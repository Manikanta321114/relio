from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Relio API"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "relio_db"
    SECRET_KEY: str = "super_secret_jwt_key_for_development_only"
    JWT_SECRET: str = "super_secret_jwt_key_for_development_only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_SECRET: Optional[str] = None
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    FRONTEND_URL: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
