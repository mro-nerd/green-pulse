"""
RBAC dependency injection for FastAPI route handlers.

═══════════════════════════════════════════════════════════════
  AUTHORITATIVE PERMISSION CONTRACT — READ BEFORE ADDING ROUTES
═══════════════════════════════════════════════════════════════

  ADMIN
    • Full access to everything across the entire organisation.
    • ONLY role that can create or remove/deactivate user accounts.
    • Can read/write any resource in any department.

  DEPARTMENT MANAGER
    • Can read AND edit resources belonging to ANY employee in their
      department (and all descendant departments).
    • Cannot create or remove user accounts — that power is Admin-only.
    • Cannot touch resources outside their department scope.

  EMPLOYEE
    • Can read and edit ONLY their own resources
      (their own participations, submissions, acknowledgements, etc.).
    • Cannot access other employees' data, even within the same dept.

─────────────────────────────────────────────────────────────────
  HOW TO ENFORCE IN EVERY ROUTE:

  1. Read endpoints (lists):
       - Admin   → no WHERE filter on dept/user
       - Manager → add WHERE departmentId IN get_dept_scope(user)
       - Employee → add WHERE userId = user.id

  2. Write endpoints (create / update):
       - Admin   → allowed always
       - Manager → check target resource's dept is IN get_dept_scope(user)
       - Employee → call assert_resource_owner(user, resource.employeeId)

  3. User account create/delete:
       - Use AdminUser dependency — no exceptions.
─────────────────────────────────────────────────────────────────

Available dependency aliases:
    CurrentUser        — any active authenticated user
    AdminUser          — Admin role only (403 otherwise)
    ManagerOrAdminUser — Department Manager OR Admin (403 otherwise)

Available helpers:
    get_dept_scope(user)                 → list[str] of allowed dept IDs
    assert_resource_owner(user, owner_id) → raises 403 if not owner/admin/manager-in-scope
"""
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.database import get_client
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)

# ── Raw token extraction ──────────────────────────────────────────────────────

async def _get_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict:
    """Extract and validate the Bearer JWT, returning its payload."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token type mismatch — expected access token",
        )
    return payload


# ── Current user hydration ────────────────────────────────────────────────────

async def get_current_user(
    payload: Annotated[dict, Depends(_get_token_payload)],
) -> dict:
    """
    Resolve the JWT subject to a live user row in the DB.
    Returns the user dict (Prisma model as dict).
    Raises 401 if user not found or account not ACTIVE.
    """
    user_id: str = payload.get("sub", "")
    db = get_client()
    user = await db.user.find_unique(
        where={"id": user_id},
        include={"department": True},
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active — awaiting admin approval or deactivated",
        )
    return user


# ── Role-enforcement dependencies ─────────────────────────────────────────────

async def require_admin(
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


async def require_manager_or_admin(
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if user.role not in ("ADMIN", "DEPARTMENT_MANAGER"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Department Manager or Admin access required",
        )
    return user


# ── Typed aliases (use these in route signatures for clean annotations) ────────

CurrentUser = Annotated[dict, Depends(get_current_user)]
AdminUser = Annotated[dict, Depends(require_admin)]
ManagerOrAdminUser = Annotated[dict, Depends(require_manager_or_admin)]


# ── Department scope helper ───────────────────────────────────────────────────

async def get_dept_scope(user) -> list[str]:
    """
    Returns the list of department IDs the user is allowed to query/write.

    Admin           → returns [] meaning "no restriction" (caller skips the filter)
    Dept Manager    → returns [own_dept_id, child_dept_id, ...] (recursive)
    Employee        → returns [own_dept_id] (their dept only — still filtered
                      further to their own records via assert_resource_owner)
    """
    if user.role == "ADMIN":
        return []  # empty sentinel = unrestricted

    if user.departmentId is None:
        return []

    db = get_client()

    async def collect_dept_ids(dept_id: str) -> list[str]:
        children = await db.department.find_many(
            where={"parentDepartmentId": dept_id}
        )
        ids = [dept_id]
        for child in children:
            ids.extend(await collect_dept_ids(child.id))
        return ids

    return await collect_dept_ids(user.departmentId)


# ── Resource ownership assertion ───────────────────────────────────────────────

async def assert_resource_owner(
    acting_user,
    resource_owner_id: str,
    resource_dept_id: str | None = None,
) -> None:
    """
    Enforce ownership rules on a single resource before allowing a write.

    Pass:
      acting_user        — the currently authenticated user (from CurrentUser dep)
      resource_owner_id  — the userId stored on the resource being modified
      resource_dept_id   — (optional) the departmentId on the resource;
                           supply this so Managers can be validated against scope

    Logic:
      ADMIN              → always allowed
      DEPARTMENT MANAGER → allowed if resource_dept_id is in their dept scope
                           (they manage all employees in their dept)
      EMPLOYEE           → allowed only if acting_user.id == resource_owner_id

    Raises HTTP 403 on any violation.
    """
    if acting_user.role == "ADMIN":
        return  # admins can touch anything

    if acting_user.role == "DEPARTMENT_MANAGER":
        if resource_dept_id is not None:
            allowed_depts = await get_dept_scope(acting_user)
            if resource_dept_id in allowed_depts:
                return
        # No dept info provided — fall back to ownership check
        if acting_user.id == resource_owner_id:
            return
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this resource",
        )

    # EMPLOYEE — own records only
    if acting_user.id != resource_owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own resources",
        )
