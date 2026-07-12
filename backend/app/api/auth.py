"""
Auth router — /api/v1/auth
Endpoints:
  POST /signup          — register (PENDING until admin approves)
  POST /login           — returns access + refresh tokens
  POST /refresh         — rotate refresh token → new access token
  POST /logout          — revoke refresh token
  GET  /me              — current user profile
  GET  /pending-users   — (Admin) list all PENDING accounts
  POST /approve/{id}    — (Admin) approve or reject a pending account
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Cookie, HTTPException, Response, status

from app.core.config import settings
from app.core.database import get_client
from app.core.deps import AdminUser, CurrentUser
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    refresh_token_expiry,
    verify_password,
)
from app.schemas.auth import (
    ApproveRejectRequest,
    LoginRequest,
    PendingUserItem,
    RefreshRequest,
    SignupRequest,
    SignupResponse,
    TokenResponse,
    UserProfile,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_user_profile(user) -> UserProfile:
    dept_name = user.department.name if user.department else None
    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        department_id=user.departmentId,
        department_name=dept_name,
        xp=user.xp,
        points=user.points,
    )


async def _issue_tokens(user, response: Response) -> TokenResponse:
    """Create an access JWT and a refresh token, set refresh as httpOnly cookie."""
    access_token = create_access_token(
        {"sub": user.id, "role": user.role, "dept": user.departmentId}
    )
    raw_refresh = generate_refresh_token()
    expiry = refresh_token_expiry()

    db = get_client()
    await db.refreshtoken.create(
        data={
            "token": raw_refresh,
            "userId": user.id,
            "expiresAt": expiry,
        }
    )

    # Store refresh token in httpOnly cookie (7 days)
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth",
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_build_user_profile(user),
    )


# ── POST /signup ──────────────────────────────────────────────────────────────

@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new employee account (requires admin approval before login is possible)",
)
async def signup(body: SignupRequest) -> SignupResponse:
    db = get_client()

    # Block anyone trying to sign up with the hardcoded admin email
    if body.email == settings.ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email address is reserved",
        )

    # Duplicate check
    existing = await db.user.find_unique(where={"email": body.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Validate department exists
    dept = await db.department.find_unique(where={"id": body.department_id})
    if dept is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department '{body.department_id}' not found",
        )

    user = await db.user.create(
        data={
            "name": body.name,
            "email": body.email,
            "passwordHash": hash_password(body.password),
            "departmentId": body.department_id,
            "role": "EMPLOYEE",
            "status": "PENDING",
        }
    )

    return SignupResponse(
        message=(
            "Account created successfully. "
            "Your registration is pending admin approval — "
            "you will be notified once your account is activated."
        ),
        user_id=user.id,
        status="PENDING",
    )


# ── POST /login ───────────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with work email and password. Returns access token + sets refresh cookie.",
)
async def login(body: LoginRequest, response: Response) -> TokenResponse:
    db = get_client()

    # ── Admin fast-path (hardcoded credentials, no DB lookup needed) ──────────
    if body.email == settings.ADMIN_EMAIL.lower():
        if not verify_password(body.password, hash_password(settings.ADMIN_PASSWORD)):
            # Re-verify without hashing on every call for the fixed admin
            if body.password != settings.ADMIN_PASSWORD:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials",
                )

        # Upsert the admin user row so the DB is consistent
        admin = await db.user.upsert(
            where={"email": settings.ADMIN_EMAIL},
            data={
                "create": {
                    "name": settings.ADMIN_NAME,
                    "email": settings.ADMIN_EMAIL,
                    "passwordHash": hash_password(settings.ADMIN_PASSWORD),
                    "role": "ADMIN",
                    "status": "ACTIVE",
                },
                "update": {},  # never overwrite admin record on login
            },
            include={"department": True},
        )
        return await _issue_tokens(admin, response)

    # ── Regular user login ────────────────────────────────────────────────────
    user = await db.user.find_unique(
        where={"email": body.email},
        include={"department": True},
    )

    if user is None or not verify_password(body.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if user.status == "PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please wait for activation.",
        )

    if user.status == "INACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact your administrator.",
        )

    return await _issue_tokens(user, response)


# ── POST /refresh ─────────────────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a valid refresh token for a new access token (token rotation).",
)
async def refresh_tokens(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    body: RefreshRequest | None = None,
) -> TokenResponse:
    """
    Accepts the refresh token either from the httpOnly cookie (preferred)
    or from the request body (for API clients that can't use cookies).
    """
    raw_token = refresh_token or (body.refresh_token if body else None)
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    db = get_client()
    token_row = await db.refreshtoken.find_unique(
        where={"token": raw_token},
        include={"user": {"include": {"department": True}}},
    )

    if token_row is None or token_row.revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or already used",
        )

    if token_row.expiresAt < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired — please log in again",
        )

    # Revoke the old token (rotation — one-time use)
    await db.refreshtoken.update(
        where={"id": token_row.id},
        data={"revoked": True},
    )

    return await _issue_tokens(token_row.user, response)


# ── POST /logout ──────────────────────────────────────────────────────────────

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Revoke refresh token and clear cookie.")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    body: RefreshRequest | None = None,
) -> None:
    raw_token = refresh_token or (body.refresh_token if body else None)
    if raw_token:
        db = get_client()
        await db.refreshtoken.update_many(
            where={"token": raw_token},
            data={"revoked": True},
        )
    response.delete_cookie("refresh_token", path="/api/v1/auth")


# ── GET /me ───────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserProfile, summary="Get the currently authenticated user's profile.")
async def me(current_user: CurrentUser) -> UserProfile:
    db = get_client()
    # Re-fetch with department to always return fresh data
    user = await db.user.find_unique(
        where={"id": current_user.id},
        include={"department": True},
    )
    return _build_user_profile(user)


# ── GET /pending-users (Admin) ────────────────────────────────────────────────

@router.get(
    "/pending-users",
    response_model=list[PendingUserItem],
    summary="[Admin] List all accounts awaiting approval.",
)
async def list_pending_users(admin: AdminUser) -> list[PendingUserItem]:
    db = get_client()
    users = await db.user.find_many(
        where={"status": "PENDING"},
        include={"department": True},
        order={"createdAt": "asc"},
    )
    return [
        PendingUserItem(
            id=u.id,
            name=u.name,
            email=u.email,
            department_id=u.departmentId,
            department_name=u.department.name if u.department else None,
            created_at=u.createdAt.isoformat(),
        )
        for u in users
    ]


# ── POST /approve/{user_id} (Admin) ──────────────────────────────────────────

@router.post(
    "/approve/{user_id}",
    response_model=dict,
    summary="[Admin] Approve or reject a pending user account.",
)
async def approve_user(user_id: str, body: ApproveRejectRequest, admin: AdminUser) -> dict:
    db = get_client()

    target = await db.user.find_unique(where={"id": user_id})
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User is already '{target.status}' — can only approve/reject PENDING accounts",
        )

    new_status = "ACTIVE" if body.action == "approve" else "INACTIVE"
    await db.user.update(
        where={"id": user_id},
        data={"status": new_status},
    )

    action_verb = "approved" if body.action == "approve" else "rejected"
    return {
        "message": f"User account {action_verb} successfully",
        "user_id": user_id,
        "new_status": new_status,
    }
