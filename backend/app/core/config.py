
"""
Application configuration management.

Uses pydantic-settings for environment variable management.
Supports local Ollama inference and existing NyayaSetu settings.
"""

from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env."""

    # Application
    APP_NAME: str = "NYAYASETU"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # Database
    DATABASE_URL: str = "sqlite:///./nyayasetu.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = Field(
        default="CHANGE_THIS_TO_A_RANDOM_SECRET_KEY_AT_LEAST_32_CHARS_LONG",
        description="Set a unique secret in the environment for real deployments.",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    ALLOWED_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:3000,"
        "http://localhost:8000,"
        "http://localhost:8001"
    )

    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated CORS origins."""
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]

    # AI configuration retained for compatibility with existing code.
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "llama3.2:3b"
    LLM_MAX_TOKENS: int = 1000
    LLM_TEMPERATURE: float = 0.65

    # Local Ollama configuration
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    OLLAMA_TIMEOUT: int = 180

    # Session Management
    SESSION_TTL_HOURS: int = 24

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "./uploads"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/nyayasetu.log"

    # Demo mode must remain disabled for actual Ollama responses.
    DEMO_MODE: bool = False

    @field_validator("OLLAMA_BASE_URL")
    @classmethod
    def validate_ollama_base_url(cls, value: str) -> str:
        """Normalize the Ollama URL."""
        value = value.strip().rstrip("/")
        if not value:
            raise ValueError("OLLAMA_BASE_URL cannot be empty.")
        return value

    @field_validator("OLLAMA_MODEL")
    @classmethod
    def validate_ollama_model(cls, value: str) -> str:
        """Validate the configured Ollama model name."""
        value = value.strip()
        if not value:
            raise ValueError("OLLAMA_MODEL cannot be empty.")
        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Shared settings instance
settings = Settings()


def get_settings() -> Settings:
    """Return the application settings."""
    return settings
