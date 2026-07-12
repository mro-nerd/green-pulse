"""
Application configuration — reads from environment variables.
Copy .env.example → .env and fill in your values.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/greenpulse"

    # ── JWT ───────────────────────────────────────────────────────────────
    JWT_SECRET: str = "change-me-in-production-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Seeded Admin credentials (fixed for now) ──────────────────────────
    ADMIN_NAME: str = "Admin"
    ADMIN_EMAIL: str = "admin@odoo.com"
    ADMIN_PASSWORD: str = "admin@odoo.com"

    # ── Email validation ──────────────────────────────────────────────────
    ALLOWED_EMAIL_DOMAIN: str = "odoo.com"
    MIN_EMAIL_LOCAL_LENGTH: int = 3  # at least 3 chars before @

    # ── App ───────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
