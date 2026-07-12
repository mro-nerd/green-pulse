"""
Governance Module — FastAPI Router
Covers: ESG Policies, Policy Acknowledgements, Audits, Compliance Issues, Governance Score

═══════════════════════════════════════════════════════════════
  RBAC SUMMARY FOR THIS MODULE
═══════════════════════════════════════════════════════════════

  Policies:
    GET list/detail    → CurrentUser (all roles)
    POST/PUT/DELETE    → AdminUser only
    POST acknowledge   → CurrentUser (any active user can ack)

  Policy Acknowledgements (stats + drill-down):
    GET                → ManagerOrAdminUser (Manager: dept-scoped)

  Audits:
    GET list/detail    → ManagerOrAdminUser (Manager: dept-scoped)
    POST/PUT/DELETE    → AdminUser only

  Compliance Issues:
    GET list/detail    → ManagerOrAdminUser (Manager: dept-scoped)
    POST               → AdminUser only
    PUT                → CurrentUser with role-branching:
                          Admin   → any field
                          Manager → any field, dept-scoped
                          Employee (if owner) → status field only
    DELETE             → AdminUser only

  Governance Score:
    GET                → CurrentUser (Employee sees own dept score)
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.core.database import get_client
from app.core.deps import (
    AdminUser,
    CurrentUser,
    ManagerOrAdminUser,
    assert_resource_owner,
    get_dept_scope,
)
from app.schemas.governance import (
    AckUserEntry,
    AuditCreate,
    AuditResponse,
    AuditUpdate,
    ComplianceIssueCreate,
    ComplianceIssueResponse,
    ComplianceIssueUpdate,
    GovernanceScoreResponse,
    PaginatedResponse,
    PolicyAckStatsResponse,
    PolicyCreate,
    PolicyResponse,
    PolicyUpdate,
)
from prisma.enums import AuditStatus, ComplianceStatus, PolicyStatus, Severity

router = APIRouter(prefix="/governance", tags=["Governance"])


# ── HELPER: Sync overdue flags ────────────────────────────────────────────────

async def sync_overdue_flags(dept_id: Optional[str] = None) -> None:
    """
    Sets overdue=True on all OPEN compliance issues whose dueDate has passed.
    Called before returning list/detail responses to keep the flag fresh.
    Equivalent to the nightly Celery job — runs inline for MVP.
    """
    db = get_client()
    now = datetime.now(timezone.utc)

    where: dict = {
        "status": ComplianceStatus.OPEN,
        "dueDate": {"lt": now},
        "overdue": False,
    }

    # If dept_id is provided, scope to issues linked to audits of that dept
    if dept_id:
        where["audit"] = {"is": {"departmentId": dept_id}}

    await db.complianceissue.update_many(
        where=where,
        data={"overdue": True},
    )


# ── HELPER: Build ComplianceIssueResponse with joins ─────────────────────────

def _build_issue_response(issue) -> ComplianceIssueResponse:
    """
    Constructs a ComplianceIssueResponse from a Prisma issue record
    that was fetched with include={'audit': {'include': {'department': True}}, 'owner': True}.
    """
    dept_id = None
    dept_name = None
    audit_title = None

    if issue.audit:
        audit_title = issue.audit.title
        if issue.audit.department:
            dept_id = issue.audit.department.id
            dept_name = issue.audit.department.name

    return ComplianceIssueResponse(
        id=issue.id,
        auditId=issue.auditId,
        auditTitle=audit_title,
        severity=issue.severity,
        description=issue.description,
        ownerId=issue.ownerId,
        ownerName=issue.owner.name if issue.owner else None,
        departmentId=dept_id,
        departmentName=dept_name,
        dueDate=issue.dueDate,
        status=issue.status,
        overdue=issue.overdue,
        createdAt=issue.createdAt,
        updatedAt=issue.updatedAt,
    )


# ═══════════════════════════════════════════════════════════════
# SUB-TAB 1 — ESG POLICIES
# ═══════════════════════════════════════════════════════════════

@router.get("/policies", response_model=PaginatedResponse[PolicyResponse])
async def list_policies(
    user: CurrentUser,
    policy_status: Optional[PolicyStatus] = Query(None, alias="status"),
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    List ESG policies.
    - Admin    → all statuses
    - Manager  → ACTIVE + ARCHIVED (not DRAFT)
    - Employee → ACTIVE only
    """
    db = get_client()
    where: dict = {}

    # Role-based status visibility
    if user.role == "ADMIN":
        if policy_status:
            where["status"] = policy_status
    elif user.role == "DEPARTMENT_MANAGER":
        allowed_statuses = [PolicyStatus.ACTIVE, PolicyStatus.ARCHIVED]
        if policy_status:
            if policy_status not in allowed_statuses:
                raise HTTPException(status_code=403, detail="Managers cannot view DRAFT policies")
            where["status"] = policy_status
        else:
            where["status"] = {"in": allowed_statuses}
    else:  # EMPLOYEE
        where["status"] = PolicyStatus.ACTIVE
        if policy_status and policy_status != PolicyStatus.ACTIVE:
            raise HTTPException(status_code=403, detail="Employees can only view ACTIVE policies")

    if category:
        where["category"] = {"contains": category, "mode": "insensitive"}

    total = await db.esgpolicy.count(where=where)
    policies = await db.esgpolicy.find_many(
        where=where,
        include={"acknowledgements": True},
        take=page_size,
        skip=(page - 1) * page_size,
        order={"effectiveDate": "desc"},
    )

    # Get total active employee count for completion rate
    total_employees = await db.user.count(where={"status": "ACTIVE", "role": {"not": "ADMIN"}})

    response_items = []
    for p in policies:
        my_ack = next(
            (a for a in (p.acknowledgements or []) if a.employeeId == user.id), None
        )
        response_items.append(
            PolicyResponse(
                id=p.id,
                title=p.title,
                body=p.body,
                category=p.category,
                version=p.version,
                effectiveDate=p.effectiveDate,
                status=p.status,
                ackCount=len(p.acknowledgements or []),
                totalEmployees=total_employees,
                myAcknowledgedAt=my_ack.acknowledgedAt if my_ack else None,
                createdAt=p.createdAt,
                updatedAt=p.updatedAt,
            )
        )

    return PaginatedResponse(items=response_items, total=total, page=page, page_size=page_size)


@router.post("/policies", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(body: PolicyCreate, admin: AdminUser):
    """Create a new ESG policy. Admin only. Defaults to DRAFT status."""
    db = get_client()

    # Enforce unique (title, version)
    existing = await db.esgpolicy.find_first(
        where={"title": body.title, "version": body.version}
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Policy '{body.title}' version '{body.version}' already exists",
        )

    policy = await db.esgpolicy.create(
        data={
            "title": body.title,
            "body": body.body,
            "category": body.category,
            "version": body.version,
            "effectiveDate": body.effectiveDate,
            "status": PolicyStatus.DRAFT,
        }
    )

    total_employees = await db.user.count(where={"status": "ACTIVE", "role": {"not": "ADMIN"}})
    return PolicyResponse(
        **{k: getattr(policy, k) for k in ["id", "title", "body", "category", "version", "effectiveDate", "status", "createdAt", "updatedAt"]},
        ackCount=0,
        totalEmployees=total_employees,
        myAcknowledgedAt=None,
    )


@router.get("/policies/{id}", response_model=PolicyResponse)
async def get_policy(id: str, user: CurrentUser):
    """Get a single policy. Employees only see ACTIVE policies."""
    db = get_client()
    policy = await db.esgpolicy.find_unique(
        where={"id": id},
        include={"acknowledgements": True},
    )
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    # Status visibility guard
    if user.role == "EMPLOYEE" and policy.status != PolicyStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Employees can only view ACTIVE policies")
    if user.role == "DEPARTMENT_MANAGER" and policy.status == PolicyStatus.DRAFT:
        raise HTTPException(status_code=403, detail="Managers cannot view DRAFT policies")

    total_employees = await db.user.count(where={"status": "ACTIVE", "role": {"not": "ADMIN"}})
    my_ack = next(
        (a for a in (policy.acknowledgements or []) if a.employeeId == user.id), None
    )

    return PolicyResponse(
        id=policy.id,
        title=policy.title,
        body=policy.body,
        category=policy.category,
        version=policy.version,
        effectiveDate=policy.effectiveDate,
        status=policy.status,
        ackCount=len(policy.acknowledgements or []),
        totalEmployees=total_employees,
        myAcknowledgedAt=my_ack.acknowledgedAt if my_ack else None,
        createdAt=policy.createdAt,
        updatedAt=policy.updatedAt,
    )


@router.put("/policies/{id}", response_model=PolicyResponse)
async def update_policy(id: str, body: PolicyUpdate, admin: AdminUser):
    """Update a policy. Admin only."""
    db = get_client()
    policy = await db.esgpolicy.find_unique(where={"id": id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    update_data = body.model_dump(exclude_unset=True)

    # Validate unique (title, version) if changing either
    new_title = update_data.get("title", policy.title)
    new_version = update_data.get("version", policy.version)
    if "title" in update_data or "version" in update_data:
        existing = await db.esgpolicy.find_first(
            where={"title": new_title, "version": new_version, "id": {"not": id}}
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Policy '{new_title}' version '{new_version}' already exists",
            )

    updated = await db.esgpolicy.update(
        where={"id": id},
        data=update_data,
        include={"acknowledgements": True},
    )

    total_employees = await db.user.count(where={"status": "ACTIVE", "role": {"not": "ADMIN"}})
    return PolicyResponse(
        id=updated.id,
        title=updated.title,
        body=updated.body,
        category=updated.category,
        version=updated.version,
        effectiveDate=updated.effectiveDate,
        status=updated.status,
        ackCount=len(updated.acknowledgements or []),
        totalEmployees=total_employees,
        myAcknowledgedAt=None,
        createdAt=updated.createdAt,
        updatedAt=updated.updatedAt,
    )


@router.delete("/policies/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(id: str, admin: AdminUser):
    """
    Delete a policy. Admin only.
    Returns 409 if acknowledgements exist (data integrity guard).
    """
    db = get_client()
    policy = await db.esgpolicy.find_unique(
        where={"id": id}, include={"acknowledgements": True}
    )
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.acknowledgements and len(policy.acknowledgements) > 0:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a policy with existing acknowledgements. Archive it instead.",
        )
    await db.esgpolicy.delete(where={"id": id})
    return None


@router.post("/policies/{id}/acknowledge", status_code=status.HTTP_201_CREATED)
async def acknowledge_policy(id: str, user: CurrentUser):
    """
    Acknowledge a policy as the current user.
    Policy must be ACTIVE. Duplicate acks return 409.
    """
    db = get_client()
    policy = await db.esgpolicy.find_unique(where={"id": id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != PolicyStatus.ACTIVE:
        raise HTTPException(
            status_code=400,
            detail="Only ACTIVE policies can be acknowledged",
        )

    # Check for existing ack
    existing_ack = await db.policyacknowledgement.find_first(
        where={"employeeId": user.id, "policyId": id}
    )
    if existing_ack:
        raise HTTPException(
            status_code=409,
            detail="You have already acknowledged this policy",
        )

    ack = await db.policyacknowledgement.create(
        data={"employeeId": user.id, "policyId": id}
    )
    return {"message": "Policy acknowledged successfully", "acknowledgedAt": ack.acknowledgedAt}


# ═══════════════════════════════════════════════════════════════
# SUB-TAB 2 — POLICY ACKNOWLEDGEMENTS
# ═══════════════════════════════════════════════════════════════

@router.get("/policies/{id}/acknowledgements", response_model=PolicyAckStatsResponse)
async def get_policy_acknowledgements(
    id: str,
    user: ManagerOrAdminUser,
    dept_id: Optional[str] = Query(None, alias="departmentId"),
):
    """
    Returns per-employee ack status for a policy with a completion rate.
    - Admin   → all active employees across the org (or filtered by dept_id)
    - Manager → scoped to own dept employees only
    """
    db = get_client()
    policy = await db.esgpolicy.find_unique(where={"id": id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    # Determine which departments to query
    if user.role == "ADMIN":
        dept_filter = {"departmentId": dept_id} if dept_id else {}
    else:
        allowed_depts = await get_dept_scope(user)
        if dept_id:
            if dept_id not in allowed_depts:
                raise HTTPException(status_code=403, detail="Access denied to requested department")
            dept_filter = {"departmentId": dept_id}
        else:
            dept_filter = {"departmentId": {"in": allowed_depts}}

    # Fetch all active non-admin employees in scope
    employees = await db.user.find_many(
        where={"status": "ACTIVE", "role": {"not": "ADMIN"}, **dept_filter},
        include={"department": True, "policyAcks": {"where": {"policyId": id}}},
    )

    employee_entries = []
    acknowledged_count = 0
    for emp in employees:
        ack = emp.policyAcks[0] if emp.policyAcks else None
        if ack:
            acknowledged_count += 1
        employee_entries.append(
            AckUserEntry(
                employeeId=emp.id,
                employeeName=emp.name,
                departmentId=emp.departmentId,
                departmentName=emp.department.name if emp.department else None,
                acknowledgedAt=ack.acknowledgedAt if ack else None,
            )
        )

    total = len(employee_entries)
    completion_pct = round((acknowledged_count / total * 100.0) if total > 0 else 0.0, 2)

    return PolicyAckStatsResponse(
        policyId=policy.id,
        policyTitle=policy.title,
        acknowledgedCount=acknowledged_count,
        totalCount=total,
        completionPct=completion_pct,
        employees=employee_entries,
    )


# ═══════════════════════════════════════════════════════════════
# SUB-TAB 3 — AUDITS
# ═══════════════════════════════════════════════════════════════

@router.get("/audits", response_model=PaginatedResponse[AuditResponse])
async def list_audits(
    user: ManagerOrAdminUser,
    audit_status: Optional[AuditStatus] = Query(None, alias="status"),
    dept_id: Optional[str] = Query(None, alias="departmentId"),
    from_date: Optional[datetime] = Query(None, alias="fromDate"),
    to_date: Optional[datetime] = Query(None, alias="toDate"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """List audits. Manager: dept-scoped. Admin: all."""
    db = get_client()
    where: dict = {}

    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if dept_id:
            if dept_id not in allowed_depts:
                raise HTTPException(status_code=403, detail="Access denied to requested department")
            where["departmentId"] = dept_id
        else:
            where["departmentId"] = {"in": allowed_depts}
    else:
        if dept_id:
            where["departmentId"] = dept_id

    if audit_status:
        where["status"] = audit_status

    if from_date or to_date:
        date_filter: dict = {}
        if from_date:
            date_filter["gte"] = from_date
        if to_date:
            date_filter["lte"] = to_date
        where["auditDate"] = date_filter

    total = await db.audit.count(where=where)
    audits = await db.audit.find_many(
        where=where,
        include={
            "department": True,
            "auditor": True,
            "complianceIssues": True,
        },
        take=page_size,
        skip=(page - 1) * page_size,
        order={"auditDate": "desc"},
    )

    response_items = []
    for a in audits:
        issues = a.complianceIssues or []
        open_issues = [i for i in issues if i.status == ComplianceStatus.OPEN]
        response_items.append(
            AuditResponse(
                id=a.id,
                title=a.title,
                departmentId=a.departmentId,
                departmentName=a.department.name if a.department else None,
                auditorId=a.auditorId,
                auditorName=a.auditor.name if a.auditor else None,
                auditDate=a.auditDate,
                findingsSummary=a.findingsSummary,
                status=a.status,
                issueCount=len(issues),
                openIssueCount=len(open_issues),
                createdAt=a.createdAt,
                updatedAt=a.updatedAt,
            )
        )

    return PaginatedResponse(items=response_items, total=total, page=page, page_size=page_size)


@router.post("/audits", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(body: AuditCreate, admin: AdminUser):
    """Create a new audit. Admin only."""
    db = get_client()

    dept = await db.department.find_unique(where={"id": body.departmentId})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    auditor = await db.user.find_unique(where={"id": body.auditorId})
    if not auditor or auditor.status != "ACTIVE":
        raise HTTPException(status_code=404, detail="Auditor user not found or is not active")

    audit = await db.audit.create(
        data={
            "title": body.title,
            "departmentId": body.departmentId,
            "auditorId": body.auditorId,
            "auditDate": body.auditDate,
            "findingsSummary": body.findingsSummary,
            "status": AuditStatus.SCHEDULED,
        },
        include={"department": True, "auditor": True},
    )

    return AuditResponse(
        id=audit.id,
        title=audit.title,
        departmentId=audit.departmentId,
        departmentName=audit.department.name if audit.department else None,
        auditorId=audit.auditorId,
        auditorName=audit.auditor.name if audit.auditor else None,
        auditDate=audit.auditDate,
        findingsSummary=audit.findingsSummary,
        status=audit.status,
        issueCount=0,
        openIssueCount=0,
        createdAt=audit.createdAt,
        updatedAt=audit.updatedAt,
    )


@router.get("/audits/{id}", response_model=AuditResponse)
async def get_audit(id: str, user: ManagerOrAdminUser):
    """Get a single audit. Manager: must own the department."""
    db = get_client()
    audit = await db.audit.find_unique(
        where={"id": id},
        include={
            "department": True,
            "auditor": True,
            "complianceIssues": True,
        },
    )
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if audit.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to this audit")

    issues = audit.complianceIssues or []
    open_issues = [i for i in issues if i.status == ComplianceStatus.OPEN]

    return AuditResponse(
        id=audit.id,
        title=audit.title,
        departmentId=audit.departmentId,
        departmentName=audit.department.name if audit.department else None,
        auditorId=audit.auditorId,
        auditorName=audit.auditor.name if audit.auditor else None,
        auditDate=audit.auditDate,
        findingsSummary=audit.findingsSummary,
        status=audit.status,
        issueCount=len(issues),
        openIssueCount=len(open_issues),
        createdAt=audit.createdAt,
        updatedAt=audit.updatedAt,
    )


@router.put("/audits/{id}", response_model=AuditResponse)
async def update_audit(id: str, body: AuditUpdate, admin: AdminUser):
    """Update an audit. Admin only."""
    db = get_client()
    audit = await db.audit.find_unique(where={"id": id})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    update_data = body.model_dump(exclude_unset=True)

    if "departmentId" in update_data:
        dept = await db.department.find_unique(where={"id": update_data["departmentId"]})
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

    if "auditorId" in update_data:
        auditor = await db.user.find_unique(where={"id": update_data["auditorId"]})
        if not auditor or auditor.status != "ACTIVE":
            raise HTTPException(status_code=404, detail="Auditor user not found or is not active")

    updated = await db.audit.update(
        where={"id": id},
        data=update_data,
        include={
            "department": True,
            "auditor": True,
            "complianceIssues": True,
        },
    )

    issues = updated.complianceIssues or []
    open_issues = [i for i in issues if i.status == ComplianceStatus.OPEN]

    return AuditResponse(
        id=updated.id,
        title=updated.title,
        departmentId=updated.departmentId,
        departmentName=updated.department.name if updated.department else None,
        auditorId=updated.auditorId,
        auditorName=updated.auditor.name if updated.auditor else None,
        auditDate=updated.auditDate,
        findingsSummary=updated.findingsSummary,
        status=updated.status,
        issueCount=len(issues),
        openIssueCount=len(open_issues),
        createdAt=updated.createdAt,
        updatedAt=updated.updatedAt,
    )


@router.delete("/audits/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_audit(id: str, admin: AdminUser):
    """
    Delete an audit. Admin only.
    Returns 409 if compliance issues exist (must be resolved first).
    """
    db = get_client()
    audit = await db.audit.find_unique(
        where={"id": id}, include={"complianceIssues": True}
    )
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    if audit.complianceIssues and len(audit.complianceIssues) > 0:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete an audit with linked compliance issues. Resolve or delete issues first.",
        )
    await db.audit.delete(where={"id": id})
    return None


# ═══════════════════════════════════════════════════════════════
# SUB-TAB 4 — COMPLIANCE ISSUES
# ═══════════════════════════════════════════════════════════════

_ISSUE_INCLUDE = {
    "audit": {"include": {"department": True}},
    "owner": True,
}


@router.get("/compliance-issues", response_model=PaginatedResponse[ComplianceIssueResponse])
async def list_compliance_issues(
    user: ManagerOrAdminUser,
    audit_id: Optional[str] = Query(None, alias="auditId"),
    severity: Optional[Severity] = None,
    issue_status: Optional[ComplianceStatus] = Query(None, alias="status"),
    overdue_only: bool = Query(False, alias="overdueOnly"),
    dept_id: Optional[str] = Query(None, alias="departmentId"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    List compliance issues. Always ordered by severity (HIGH first) then dueDate ascending.
    Syncs overdue flags before returning.
    """
    db = get_client()

    # Sync overdue flags for the relevant scope first
    await sync_overdue_flags(dept_id if user.role != "ADMIN" else dept_id)

    where: dict = {}

    # Department scoping via the linked audit
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        scope_dept = dept_id if dept_id else None
        if scope_dept and scope_dept not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to requested department")

        dept_scope = [scope_dept] if scope_dept else allowed_depts
        where["audit"] = {"is": {"departmentId": {"in": dept_scope}}}
    else:
        if dept_id:
            where["audit"] = {"is": {"departmentId": dept_id}}

    if audit_id:
        where["auditId"] = audit_id
    if severity:
        where["severity"] = severity
    if issue_status:
        where["status"] = issue_status
    if overdue_only:
        where["overdue"] = True

    total = await db.complianceissue.count(where=where)
    # Order: severity (HIGH > MEDIUM > LOW) then dueDate ascending
    # Prisma does not support computed order, so we order by dueDate and sort severity in Python
    issues = await db.complianceissue.find_many(
        where=where,
        include=_ISSUE_INCLUDE,
        take=page_size,
        skip=(page - 1) * page_size,
        order={"dueDate": "asc"},
    )

    # Sort by severity priority: HIGH=0, MEDIUM=1, LOW=2
    _sev_order = {Severity.HIGH: 0, Severity.MEDIUM: 1, Severity.LOW: 2}
    issues.sort(key=lambda i: (_sev_order.get(i.severity, 3), i.dueDate))

    return PaginatedResponse(
        items=[_build_issue_response(i) for i in issues],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/compliance-issues", response_model=ComplianceIssueResponse, status_code=status.HTTP_201_CREATED)
async def create_compliance_issue(body: ComplianceIssueCreate, admin: AdminUser):
    """
    Create a compliance issue. Admin only.
    auditId is REQUIRED — every issue must be linked to an audit.
    severity, ownerId, and dueDate are mandatory.
    """
    db = get_client()

    # Validate audit exists
    audit = await db.audit.find_unique(where={"id": body.auditId})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # Validate owner exists and is active
    owner = await db.user.find_unique(where={"id": body.ownerId})
    if not owner or owner.status != "ACTIVE":
        raise HTTPException(status_code=404, detail="Owner user not found or is not active")

    # Set initial overdue flag
    now = datetime.now(timezone.utc)
    due_utc = body.dueDate.replace(tzinfo=timezone.utc) if body.dueDate.tzinfo is None else body.dueDate
    initial_overdue = due_utc < now

    issue = await db.complianceissue.create(
        data={
            "auditId": body.auditId,
            "severity": body.severity,
            "description": body.description,
            "ownerId": body.ownerId,
            "dueDate": body.dueDate,
            "status": ComplianceStatus.OPEN,
            "overdue": initial_overdue,
        },
        include=_ISSUE_INCLUDE,
    )

    return _build_issue_response(issue)


@router.get("/compliance-issues/{id}", response_model=ComplianceIssueResponse)
async def get_compliance_issue(id: str, user: ManagerOrAdminUser):
    """Get a single compliance issue. Manager: dept-scoped via linked audit."""
    db = get_client()
    await sync_overdue_flags()

    issue = await db.complianceissue.find_unique(
        where={"id": id}, include=_ISSUE_INCLUDE
    )
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")

    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        dept_id = issue.audit.departmentId if issue.audit else None
        if not dept_id or dept_id not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to this compliance issue")

    return _build_issue_response(issue)


@router.put("/compliance-issues/{id}", response_model=ComplianceIssueResponse)
async def update_compliance_issue(id: str, body: ComplianceIssueUpdate, user: CurrentUser):
    """
    Update a compliance issue.

    Role-branching logic:
      Admin    → can update any field
      Manager  → can update any field for dept-scoped issues
      Employee → can ONLY update `status` if they are the assigned owner
                 (attempting to update any other field → 403)
    """
    db = get_client()
    issue = await db.complianceissue.find_unique(
        where={"id": id}, include=_ISSUE_INCLUDE
    )
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")

    update_data = body.model_dump(exclude_unset=True)

    if user.role == "EMPLOYEE":
        # Employee can ONLY update `status` if they are the owner
        if issue.ownerId != user.id:
            raise HTTPException(
                status_code=403,
                detail="Employees can only update compliance issues they are assigned to",
            )
        non_status_fields = {k for k in update_data if k != "status"}
        if non_status_fields:
            raise HTTPException(
                status_code=403,
                detail=f"Employees can only update the status field. Attempted fields: {list(non_status_fields)}",
            )

    elif user.role == "DEPARTMENT_MANAGER":
        allowed_depts = await get_dept_scope(user)
        dept_id = issue.audit.departmentId if issue.audit else None
        if not dept_id or dept_id not in allowed_depts:
            raise HTTPException(
                status_code=403, detail="Access denied to this compliance issue"
            )

    # If status is being resolved, clear the overdue flag
    if update_data.get("status") == ComplianceStatus.RESOLVED:
        update_data["overdue"] = False

    # Validate new ownerId if being updated
    if "ownerId" in update_data:
        owner = await db.user.find_unique(where={"id": update_data["ownerId"]})
        if not owner or owner.status != "ACTIVE":
            raise HTTPException(status_code=404, detail="Owner user not found or is not active")

    # Recalculate overdue if dueDate is updated and status stays OPEN
    if "dueDate" in update_data and update_data.get("status", issue.status) == ComplianceStatus.OPEN:
        now = datetime.now(timezone.utc)
        new_due = update_data["dueDate"]
        due_utc = new_due.replace(tzinfo=timezone.utc) if new_due.tzinfo is None else new_due
        update_data["overdue"] = due_utc < now

    updated = await db.complianceissue.update(
        where={"id": id},
        data=update_data,
        include=_ISSUE_INCLUDE,
    )

    return _build_issue_response(updated)


@router.delete("/compliance-issues/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_compliance_issue(id: str, admin: AdminUser):
    """Delete a compliance issue. Admin only."""
    db = get_client()
    issue = await db.complianceissue.find_unique(where={"id": id})
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    await db.complianceissue.delete(where={"id": id})
    return None


# ═══════════════════════════════════════════════════════════════
# GOVERNANCE SCORE  (feeds Dashboard KPI tile)
# ═══════════════════════════════════════════════════════════════

@router.get("/scores/governance", response_model=GovernanceScoreResponse)
async def get_governance_score(
    user: CurrentUser,
    dept_id: Optional[str] = Query(None, alias="departmentId"),
    period_start: Optional[datetime] = Query(None, alias="periodStart"),
    period_end: Optional[datetime] = Query(None, alias="periodEnd"),
):
    """
    Computes a 0–100 governance score for a department.

    Formula:
      policy_ack_rate    = (employees who acked all ACTIVE policies) / total_dept_employees × 100
      audit_pass_rate    = audits with 0 HIGH-severity issues / total completed audits × 100
      open_issues_weight = Σ(HIGH=3, MEDIUM=2, LOW=1) for OPEN issues, normalised and capped at 30

      score = (policy_ack_rate × 0.40) + (audit_pass_rate × 0.40) − open_issues_penalty
              clamped to [0, 100]

    Access:
      Employee → automatically scoped to their own department
      Manager  → defaults to own dept; can query child depts
      Admin    → must supply departmentId
    """
    db = get_client()

    # Resolve target department
    target_dept_id = dept_id
    if user.role == "ADMIN":
        if not target_dept_id:
            raise HTTPException(status_code=400, detail="departmentId is required for admin queries")
    elif user.role == "DEPARTMENT_MANAGER":
        allowed_depts = await get_dept_scope(user)
        if not target_dept_id:
            target_dept_id = user.departmentId
        if not target_dept_id or target_dept_id not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to requested department")
    else:  # EMPLOYEE
        # Employee always sees their own department score
        target_dept_id = user.departmentId
        if not target_dept_id:
            raise HTTPException(status_code=400, detail="You are not assigned to a department")

    now = datetime.now(timezone.utc)
    p_start = period_start or (now - timedelta(days=365))
    p_end = period_end or now

    # ── Component 1: Policy Acknowledgement Rate ──────────────────────────────
    # Get all ACTIVE policies in the period
    active_policies = await db.esgpolicy.find_many(
        where={
            "status": PolicyStatus.ACTIVE,
            "effectiveDate": {"lte": p_end},
        }
    )
    active_policy_ids = [p.id for p in active_policies]

    # Get active employees in the department
    dept_employees = await db.user.find_many(
        where={
            "departmentId": target_dept_id,
            "status": "ACTIVE",
            "role": {"not": "ADMIN"},
        }
    )
    dept_employee_count = len(dept_employees)

    policy_ack_rate = 0.0
    if dept_employee_count > 0 and active_policy_ids:
        # Count employees who have acked ALL active policies
        fully_acked_count = 0
        for emp in dept_employees:
            emp_acks = await db.policyacknowledgement.count(
                where={"employeeId": emp.id, "policyId": {"in": active_policy_ids}}
            )
            if emp_acks >= len(active_policy_ids):
                fully_acked_count += 1
        policy_ack_rate = (fully_acked_count / dept_employee_count) * 100.0

    # ── Component 2: Audit Pass Rate ──────────────────────────────────────────
    completed_audits = await db.audit.find_many(
        where={
            "departmentId": target_dept_id,
            "status": AuditStatus.COMPLETED,
            "auditDate": {"gte": p_start, "lte": p_end},
        },
        include={"complianceIssues": True},
    )
    total_completed = len(completed_audits)
    audit_pass_rate = 0.0
    if total_completed > 0:
        # An audit "passes" if it has zero HIGH-severity issues
        passed = sum(
            1 for a in completed_audits
            if not any(
                i.severity == Severity.HIGH
                for i in (a.complianceIssues or [])
            )
        )
        audit_pass_rate = (passed / total_completed) * 100.0

    # ── Component 3: Open Issues Penalty ─────────────────────────────────────
    open_issues = await db.complianceissue.find_many(
        where={
            "status": ComplianceStatus.OPEN,
            "audit": {"is": {"departmentId": target_dept_id}},
        }
    )
    _sev_weight = {Severity.HIGH: 3, Severity.MEDIUM: 2, Severity.LOW: 1}
    raw_penalty = sum(_sev_weight.get(i.severity, 0) for i in open_issues)
    # Normalise: cap at max 30 points penalty (raw score of ~10 issues ≈ 30 pts)
    open_issues_penalty = min(raw_penalty * 1.5, 30.0)

    # ── Final Score ───────────────────────────────────────────────────────────
    raw_score = (policy_ack_rate * 0.40) + (audit_pass_rate * 0.40) - open_issues_penalty
    final_score = round(max(0.0, min(100.0, raw_score)), 2)

    return GovernanceScoreResponse(
        departmentId=target_dept_id,
        score=final_score,
        policyAckRate=round(policy_ack_rate, 2),
        auditPassRate=round(audit_pass_rate, 2),
        openIssuesPenalty=round(open_issues_penalty, 2),
        activeIssueCount=len(open_issues),
        periodStart=p_start,
        periodEnd=p_end,
    )
