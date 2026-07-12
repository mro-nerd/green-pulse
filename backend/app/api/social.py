from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File

from app.core.database import get_client
from app.core.deps import CurrentUser, AdminUser, ManagerOrAdminUser, get_dept_scope
from app.schemas.social import (
    PaginatedResponse,
    CsrActivityCreate,
    CsrActivityUpdate,
    CsrActivityResponse,
    EmployeeParticipationResponse,
    ApproveRequest,
    DiversityMetricsResponse,
    GenderMetrics,
    AgeBandMetrics,
    SeniorityMetrics,
    SocialScoreResponse,
)
from prisma.enums import ApprovalStatus
from prisma.models import User

import cloudinary.uploader

router = APIRouter(prefix="/social", tags=["Social"])


# ── CSR ACTIVITIES ────────────────────────────────────────────────────────────

@router.get("/csr-activities", response_model=PaginatedResponse[CsrActivityResponse])
async def list_csr_activities(
    user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    db = get_client()
    where = {}

    # Scoping: Employees see activities available to them (their dept or global)
    # Managers see their scope or global. Admins see all.
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        # null departmentId means organization-wide activity
        where["OR"] = [
            {"departmentId": {"in": allowed_depts}},
            {"departmentId": None}
        ]

    total = await db.csractivity.count(where=where)
    items = await db.csractivity.find_many(
        where=where,
        take=page_size,
        skip=(page - 1) * page_size,
        order={"createdAt": "desc"}
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("/csr-activities", response_model=CsrActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_csr_activity(body: CsrActivityCreate, user: ManagerOrAdminUser):
    db = get_client()

    if user.role != "ADMIN":
        if body.departmentId:
            allowed_depts = await get_dept_scope(user)
            if body.departmentId not in allowed_depts:
                raise HTTPException(status_code=403, detail="Cannot create activity for this department")
        else:
            # Only admin can create global activities
            raise HTTPException(status_code=403, detail="Only Admins can create global activities (departmentId = null)")

    item = await db.csractivity.create(
        data={
            "title": body.title,
            "categoryId": body.categoryId,
            "description": body.description,
            "departmentId": body.departmentId,
            "evidenceRequired": body.evidenceRequired,
            "status": body.status,
        }
    )
    return item

@router.get("/csr-activities/{id}", response_model=CsrActivityResponse)
async def get_csr_activity(id: str, user: CurrentUser):
    db = get_client()
    item = await db.csractivity.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="CSR Activity not found")
    
    # Optional: could enforce reading scope here too.
    return item

@router.put("/csr-activities/{id}", response_model=CsrActivityResponse)
async def update_csr_activity(id: str, body: CsrActivityUpdate, user: ManagerOrAdminUser):
    db = get_client()
    item = await db.csractivity.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="CSR Activity not found")

    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if item.departmentId and item.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to edit this activity")
        if body.departmentId and body.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Cannot assign activity to this department")

    update_data = body.model_dump(exclude_unset=True)
    updated = await db.csractivity.update(
        where={"id": id},
        data=update_data
    )
    return updated

@router.delete("/csr-activities/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_csr_activity(id: str, admin: AdminUser):
    db = get_client()
    item = await db.csractivity.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="CSR Activity not found")
    await db.csractivity.delete(where={"id": id})
    return None


# ── EMPLOYEE PARTICIPATIONS ───────────────────────────────────────────────────

@router.get("/participations", response_model=PaginatedResponse[EmployeeParticipationResponse])
async def list_participations(
    user: CurrentUser,
    status_filter: Optional[ApprovalStatus] = Query(None, alias="status"),
    activity_id: Optional[str] = Query(None, alias="activityId"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    db = get_client()
    where = {}

    if user.role == "EMPLOYEE":
        # Employees only see their own participations
        where["employeeId"] = user.id
    elif user.role == "DEPARTMENT_MANAGER":
        # Managers see participations of employees in their scope
        allowed_depts = await get_dept_scope(user)
        where["employee"] = {"is": {"departmentId": {"in": allowed_depts}}}
    
    if status_filter:
        where["approvalStatus"] = status_filter
    if activity_id:
        where["csrActivityId"] = activity_id

    total = await db.employeeparticipation.count(where=where)
    items = await db.employeeparticipation.find_many(
        where=where,
        take=page_size,
        skip=(page - 1) * page_size,
        include={"employee": True, "csrActivity": True},
        order={"completionDate": "desc"}
    )

    response_items = []
    for it in items:
        response_items.append(
            EmployeeParticipationResponse(
                id=it.id,
                employeeId=it.employeeId,
                employeeName=it.employee.name if it.employee else None,
                csrActivityId=it.csrActivityId,
                csrActivityTitle=it.csrActivity.title if it.csrActivity else None,
                proofUrl=it.proofUrl,
                approvalStatus=it.approvalStatus,
                pointsEarned=it.pointsEarned,
                completionDate=it.completionDate,
            )
        )
    return PaginatedResponse(items=response_items, total=total, page=page, page_size=page_size)


@router.post("/csr-activities/{id}/join", response_model=EmployeeParticipationResponse)
async def join_csr_activity(id: str, user: CurrentUser):
    """Allows an employee to join an activity."""
    db = get_client()
    activity = await db.csractivity.find_unique(where={"id": id})
    if not activity:
        raise HTTPException(status_code=404, detail="CSR Activity not found")
    
    # Check if already joined
    existing = await db.employeeparticipation.find_first(
        where={"employeeId": user.id, "csrActivityId": id}
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already joined this activity")

    part = await db.employeeparticipation.create(
        data={
            "employeeId": user.id,
            "csrActivityId": id,
            "approvalStatus": ApprovalStatus.PENDING,
        },
        include={"employee": True, "csrActivity": True}
    )
    return EmployeeParticipationResponse(
        id=part.id,
        employeeId=part.employeeId,
        employeeName=part.employee.name if part.employee else None,
        csrActivityId=part.csrActivityId,
        csrActivityTitle=part.csrActivity.title if part.csrActivity else None,
        proofUrl=part.proofUrl,
        approvalStatus=part.approvalStatus,
        pointsEarned=part.pointsEarned,
        completionDate=part.completionDate,
    )


@router.post("/participations/{id}/submit-proof", response_model=EmployeeParticipationResponse)
async def submit_proof(id: str, user: CurrentUser, file: UploadFile = File(...)):
    """Upload proof image to Cloudinary and attach URL to participation."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    db = get_client()
    part = await db.employeeparticipation.find_unique(
        where={"id": id},
        include={"employee": True, "csrActivity": True}
    )
    if not part:
        raise HTTPException(status_code=404, detail="Participation not found")
    
    # Only owner can submit their own proof
    if part.employeeId != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to submit proof for this participation")

    try:
        # Upload to cloudinary
        result = cloudinary.uploader.upload(file.file, resource_type="image")
        proof_url = result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")

    updated = await db.employeeparticipation.update(
        where={"id": id},
        data={"proofUrl": proof_url, "completionDate": datetime.now(timezone.utc)},
        include={"employee": True, "csrActivity": True}
    )

    return EmployeeParticipationResponse(
        id=updated.id,
        employeeId=updated.employeeId,
        employeeName=updated.employee.name if updated.employee else None,
        csrActivityId=updated.csrActivityId,
        csrActivityTitle=updated.csrActivity.title if updated.csrActivity else None,
        proofUrl=updated.proofUrl,
        approvalStatus=updated.approvalStatus,
        pointsEarned=updated.pointsEarned,
        completionDate=updated.completionDate,
    )


@router.post("/participations/{id}/approve", response_model=EmployeeParticipationResponse)
async def approve_participation(id: str, body: ApproveRequest, user: ManagerOrAdminUser):
    """Manager approves participation and awards points."""
    db = get_client()
    part = await db.employeeparticipation.find_unique(where={"id": id}, include={"employee": True, "csrActivity": True})
    if not part:
        raise HTTPException(status_code=404, detail="Participation not found")

    if part.approvalStatus == ApprovalStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Already approved")

    # Scope check
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        employee_dept = part.employee.departmentId if part.employee else None
        if employee_dept not in allowed_depts:
            raise HTTPException(status_code=403, detail="Cannot approve participation outside your department scope")

    # Approve and award points transactionally
    async with db.tx() as transaction:
        updated_part = await transaction.employeeparticipation.update(
            where={"id": id},
            data={
                "approvalStatus": ApprovalStatus.APPROVED,
                "pointsEarned": body.pointsToAward,
                "completionDate": datetime.now(timezone.utc)
            },
            include={"employee": True, "csrActivity": True}
        )
        
        # Add points to user
        await transaction.user.update(
            where={"id": part.employeeId},
            data={"points": {"increment": body.pointsToAward}}
        )

    return EmployeeParticipationResponse(
        id=updated_part.id,
        employeeId=updated_part.employeeId,
        employeeName=updated_part.employee.name if updated_part.employee else None,
        csrActivityId=updated_part.csrActivityId,
        csrActivityTitle=updated_part.csrActivity.title if updated_part.csrActivity else None,
        proofUrl=updated_part.proofUrl,
        approvalStatus=updated_part.approvalStatus,
        pointsEarned=updated_part.pointsEarned,
        completionDate=updated_part.completionDate,
    )


@router.post("/participations/{id}/reject", response_model=EmployeeParticipationResponse)
async def reject_participation(id: str, user: ManagerOrAdminUser):
    """Manager rejects participation."""
    db = get_client()
    part = await db.employeeparticipation.find_unique(where={"id": id}, include={"employee": True, "csrActivity": True})
    if not part:
        raise HTTPException(status_code=404, detail="Participation not found")

    if part.approvalStatus == ApprovalStatus.REJECTED:
        raise HTTPException(status_code=400, detail="Already rejected")

    # Scope check
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        employee_dept = part.employee.departmentId if part.employee else None
        if employee_dept not in allowed_depts:
            raise HTTPException(status_code=403, detail="Cannot reject participation outside your department scope")

    updated_part = await db.employeeparticipation.update(
        where={"id": id},
        data={"approvalStatus": ApprovalStatus.REJECTED},
        include={"employee": True, "csrActivity": True}
    )

    return EmployeeParticipationResponse(
        id=updated_part.id,
        employeeId=updated_part.employeeId,
        employeeName=updated_part.employee.name if updated_part.employee else None,
        csrActivityId=updated_part.csrActivityId,
        csrActivityTitle=updated_part.csrActivity.title if updated_part.csrActivity else None,
        proofUrl=updated_part.proofUrl,
        approvalStatus=updated_part.approvalStatus,
        pointsEarned=updated_part.pointsEarned,
        completionDate=updated_part.completionDate,
    )


# ── DIVERSITY DASHBOARD ───────────────────────────────────────────────────────

@router.get("/diversity", response_model=DiversityMetricsResponse)
async def get_diversity_metrics(
    user: ManagerOrAdminUser,
    dept_id: Optional[str] = Query(None, alias="departmentId")
):
    """Aggregates diversity data from the User model for a specific department."""
    db = get_client()

    target_dept = dept_id
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if not target_dept:
            target_dept = user.departmentId
        if not target_dept or target_dept not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to requested department")
    else:
        if not target_dept:
            raise HTTPException(status_code=400, detail="departmentId is required for admin queries")

    employees = await db.user.find_many(where={"departmentId": target_dept})
    total = len(employees)

    gender_counts = {}
    age_bands = {"<25": 0, "25-34": 0, "35-44": 0, "45+": 0, "Unknown": 0}
    seniority_counts = {}

    for e in employees:
        # Gender
        g = e.gender or "Unknown"
        gender_counts[g] = gender_counts.get(g, 0) + 1
        
        # Seniority
        s = e.seniorityLevel or "Unknown"
        seniority_counts[s] = seniority_counts.get(s, 0) + 1
        
        # Age
        if e.age is None:
            age_bands["Unknown"] += 1
        elif e.age < 25:
            age_bands["<25"] += 1
        elif e.age <= 34:
            age_bands["25-34"] += 1
        elif e.age <= 44:
            age_bands["35-44"] += 1
        else:
            age_bands["45+"] += 1

    return DiversityMetricsResponse(
        departmentId=target_dept,
        totalEmployees=total,
        genderRatio=[GenderMetrics(gender=k, count=v) for k, v in gender_counts.items()],
        ageBands=[AgeBandMetrics(band=k, count=v) for k, v in age_bands.items()],
        seniorityBreakdown=[SeniorityMetrics(level=k, count=v) for k, v in seniority_counts.items()]
    )


# ── SOCIAL SCORE ──────────────────────────────────────────────────────────────

@router.get("/scores/social", response_model=SocialScoreResponse)
async def get_social_score(
    user: ManagerOrAdminUser,
    dept_id: Optional[str] = Query(None, alias="departmentId")
):
    """
    Computes social score for a department.
    Score = (approved_participations / total_participations) * 100
    """
    db = get_client()

    target_dept = dept_id
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if not target_dept:
            target_dept = user.departmentId
        if not target_dept or target_dept not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to requested department")
    else:
        if not target_dept:
            raise HTTPException(status_code=400, detail="departmentId is required for admin queries")

    # Total activities (global or specific to this dept)
    activities = await db.csractivity.count(where={
        "OR": [
            {"departmentId": target_dept},
            {"departmentId": None}
        ]
    })

    # Participations from employees in this dept
    participations = await db.employeeparticipation.find_many(
        where={"employee": {"is": {"departmentId": target_dept}}}
    )

    total_parts = len(participations)
    approved_parts = sum(1 for p in participations if p.approvalStatus == ApprovalStatus.APPROVED)

    score = 0.0
    if total_parts > 0:
        score = (approved_parts / total_parts) * 100.0

    return SocialScoreResponse(
        departmentId=target_dept,
        score=round(score, 2),
        totalParticipations=total_parts,
        approvedParticipations=approved_parts,
        totalCsrActivities=activities,
    )
