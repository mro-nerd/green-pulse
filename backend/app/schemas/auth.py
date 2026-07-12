"""
Pydantic request/response schemas for the auth module.
"""
import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.config import settings

# ── Shared email validator ────────────────────────────────────────────────────

_EMAIL_RE = re.compile(
    rf"^[a-zA-Z0-9._%+\-]{{3,}}@{re.escape(settings.ALLOWED_EMAIL_DOMAIN)}$"
)


def _validate_work_email(v: str) -> str:
    v = v.strip().lower()
    local, _, domain = v.partition("@")
    if domain != settings.ALLOWED_EMAIL_DOMAIN:
        raise ValueError(
            f"Email must be a @{settings.ALLOWED_EMAIL_DOMAIN} work address"
        )
    if len(local) < settings.MIN_EMAIL_LOCAL_LENGTH:
        raise ValueError(
            f"Email local part must be at least {settings.MIN_EMAIL_LOCAL_LENGTH} characters "
            f"(e.g. xxx@{settings.ALLOWED_EMAIL_DOMAIN})"
        )
    if not _EMAIL_RE.match(v):
        raise ValueError("Invalid email format")
    return v


# ── Sign-up ───────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    email: str = Field(..., examples=["jane@odoo.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["str0ngPass!"])
    department_id: str = Field(..., description="ID of the department the user belongs to")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _validate_work_email(v)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank")
        return v


class SignupResponse(BaseModel):
    message: str
    user_id: str
    status: Literal["PENDING"]


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str = Field(..., examples=["jane@odoo.com"])
    password: str = Field(..., examples=["str0ngPass!"])

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _validate_work_email(v)


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int  # seconds
    user: "UserProfile"


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    department_id: str | None
    department_name: str | None
    xp: int
    points: int


TokenResponse.model_rebuild()


# ── Refresh ───────────────────────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str


# ── Admin: list pending users ─────────────────────────────────────────────────

class PendingUserItem(BaseModel):
    id: str
    name: str
    email: str
    department_id: str | None
    department_name: str | None
    created_at: str


class ApproveRejectRequest(BaseModel):
    action: Literal["approve", "reject"]
