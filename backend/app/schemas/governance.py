from datetime import datetime
from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel, Field
from prisma.enums import PolicyStatus, AuditStatus, Severity, ComplianceStatus

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int


# ── ESG Policies ──────────────────────────────────────────────────────────────

class PolicyCreate(BaseModel):
    title: str = Field(..., examples=["Data Privacy Policy"])
    body: str = Field(..., description="Full policy text / HTML content")
    category: str = Field(..., examples=["Data Governance"])
    version: str = Field(..., examples=["v1.0"])
    effectiveDate: datetime


class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    version: Optional[str] = None
    effectiveDate: Optional[datetime] = None
    status: Optional[PolicyStatus] = None


class PolicyResponse(BaseModel):
    id: str
    title: str
    body: str
    category: str
    version: str
    effectiveDate: datetime
    status: PolicyStatus
    # Computed fields (injected at query time)
    ackCount: Optional[int] = None          # How many employees have acknowledged
    totalEmployees: Optional[int] = None    # Total active employees in the org
    myAcknowledgedAt: Optional[datetime] = None  # Current user's ack timestamp (if any)
    createdAt: datetime
    updatedAt: datetime


# ── Policy Acknowledgements ───────────────────────────────────────────────────

class AckUserEntry(BaseModel):
    """One row in the policy acknowledgement drill-down table."""
    employeeId: str
    employeeName: str
    departmentId: Optional[str] = None
    departmentName: Optional[str] = None
    acknowledgedAt: Optional[datetime] = None   # None = not yet acknowledged


class PolicyAckStatsResponse(BaseModel):
    policyId: str
    policyTitle: str
    acknowledgedCount: int
    totalCount: int
    completionPct: float
    employees: List[AckUserEntry]


# ── Audits ────────────────────────────────────────────────────────────────────

class AuditCreate(BaseModel):
    title: str = Field(..., examples=["Q3 Financial Audit"])
    departmentId: str
    auditorId: str = Field(..., description="User ID of the auditor conducting this audit")
    auditDate: datetime
    findingsSummary: Optional[str] = None


class AuditUpdate(BaseModel):
    title: Optional[str] = None
    departmentId: Optional[str] = None
    auditorId: Optional[str] = None
    auditDate: Optional[datetime] = None
    findingsSummary: Optional[str] = None
    status: Optional[AuditStatus] = None


class AuditResponse(BaseModel):
    id: str
    title: str
    departmentId: str
    departmentName: Optional[str] = None
    auditorId: str
    auditorName: Optional[str] = None
    auditDate: datetime
    findingsSummary: Optional[str] = None
    status: AuditStatus
    issueCount: Optional[int] = None        # Total compliance issues linked to this audit
    openIssueCount: Optional[int] = None    # Open issues only
    createdAt: datetime
    updatedAt: datetime


# ── Compliance Issues ─────────────────────────────────────────────────────────

class ComplianceIssueCreate(BaseModel):
    auditId: str = Field(..., description="ID of the audit this issue belongs to (required)")
    severity: Severity = Field(..., description="LOW | MEDIUM | HIGH")
    description: str = Field(..., description="Detailed description of the compliance violation")
    ownerId: str = Field(..., description="User ID assigned as the owner/resolver of this issue")
    dueDate: datetime = Field(..., description="Deadline for resolution")


class ComplianceIssueUpdate(BaseModel):
    # Admin / Manager fields
    severity: Optional[Severity] = None
    description: Optional[str] = None
    ownerId: Optional[str] = None
    dueDate: Optional[datetime] = None
    # Employee (owner) + Manager + Admin fields
    status: Optional[ComplianceStatus] = None


class ComplianceIssueResponse(BaseModel):
    id: str
    auditId: Optional[str] = None
    auditTitle: Optional[str] = None        # Joined from Audit
    severity: Severity
    description: str
    ownerId: str
    ownerName: Optional[str] = None         # Joined from User
    departmentId: Optional[str] = None      # Derived from linked audit's department
    departmentName: Optional[str] = None    # Joined from Department
    dueDate: datetime
    status: ComplianceStatus
    overdue: bool
    createdAt: datetime
    updatedAt: datetime


# ── Governance Score ──────────────────────────────────────────────────────────

class GovernanceScoreResponse(BaseModel):
    departmentId: str
    score: float = Field(..., description="Governance score 0-100")
    policyAckRate: float = Field(..., description="Policy acknowledgement rate 0-100")
    auditPassRate: float = Field(..., description="Audit pass rate (no HIGH issues) 0-100")
    openIssuesPenalty: float = Field(..., description="Penalty deducted for open issues (0-30)")
    activeIssueCount: int
    periodStart: datetime
    periodEnd: datetime
