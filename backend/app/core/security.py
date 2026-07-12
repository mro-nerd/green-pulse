"""
Security helpers:
  - password hashing (bcrypt via passlib)
  - JWT access-token creation & decoding
  - refresh-token generation
"""
import secrets
from datetime import datetime, timedelta, timezone

import jwt
import bcrypt

from app.core.config import settings

def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


# ── Access JWT ────────────────────────────────────────────────────────────────
def create_access_token(payload: dict) -> str:
    """
    Encode a short-lived access JWT.
    `payload` should contain at minimum: {"sub": user_id, "role": role, "dept": dept_id}
    """
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    data["iat"] = datetime.now(timezone.utc)
    data["type"] = "access"
    return jwt.encode(data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate an access JWT.
    Raises jwt.PyJWTError on invalid / expired tokens.
    """
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])


# ── Refresh token ─────────────────────────────────────────────────────────────
def generate_refresh_token() -> str:
    """Cryptographically random opaque refresh token (stored in DB)."""
    return secrets.token_urlsafe(64)


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
