from datetime import datetime
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel, Field
from prisma.enums import ApprovalStatus

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int

# ── CSR Activities ────────────────────────────────────────────────────────────

class CsrActivityCreate(BaseModel):
    title: str = Field(..., examples=["Beach Cleanup"])
    categoryId: Optional[str] = None
    description: str = Field(..., examples=["Join us to clean the local beach."])
    departmentId: Optional[str] = None
    evidenceRequired: bool = False
    status: str = "active"

class CsrActivityUpdate(BaseModel):
    title: Optional[str] = None
    categoryId: Optional[str] = None
    description: Optional[str] = None
    departmentId: Optional[str] = None
    evidenceRequired: Optional[bool] = None
    status: Optional[str] = None

class CsrActivityResponse(BaseModel):
    id: str
    title: str
    categoryId: Optional[str] = None
    description: str
    departmentId: Optional[str] = None
    evidenceRequired: bool
    status: str
    createdAt: datetime
    updatedAt: datetime

# ── Employee Participations ───────────────────────────────────────────────────

class EmployeeParticipationResponse(BaseModel):
    id: str
    employeeId: str
    employeeName: Optional[str] = None
    csrActivityId: str
    csrActivityTitle: Optional[str] = None
    proofUrl: Optional[str] = None
    approvalStatus: ApprovalStatus
    pointsEarned: int
    completionDate: Optional[datetime] = None

class ApproveRequest(BaseModel):
    pointsToAward: int = Field(50, description="Points to award the user upon approval")

# ── Diversity Dashboard ───────────────────────────────────────────────────────

class GenderMetrics(BaseModel):
    gender: str
    count: int

class AgeBandMetrics(BaseModel):
    band: str
    count: int

class SeniorityMetrics(BaseModel):
    level: str
    count: int

class DiversityMetricsResponse(BaseModel):
    departmentId: str
    totalEmployees: int
    genderRatio: List[GenderMetrics]
    ageBands: List[AgeBandMetrics]
    seniorityBreakdown: List[SeniorityMetrics]

# ── Social Score ──────────────────────────────────────────────────────────────

class SocialScoreResponse(BaseModel):
    departmentId: Optional[str] = None
    score: float
    totalParticipations: int
    approvedParticipations: int
    totalCsrActivities: int
