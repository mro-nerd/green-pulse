from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.database import get_client
from app.core.deps import CurrentUser, AdminUser, ManagerOrAdminUser, get_dept_scope
from app.schemas.environmental import (
    PaginatedResponse,
    EmissionFactorCreate,
    EmissionFactorUpdate,
    EmissionFactorResponse,
    ProductEsgProfileCreate,
    ProductEsgProfileUpdate,
    ProductEsgProfileResponse,
    CarbonTransactionCreate,
    CarbonTransactionUpdate,
    CarbonTransactionResponse,
    EnvironmentalGoalCreate,
    EnvironmentalGoalUpdate,
    EnvironmentalGoalResponse,
    EnvironmentalScoreResponse,
)
from prisma.enums import GoalStatus, SourceType

router = APIRouter(prefix="/environmental", tags=["Environmental"])

# ── HELPERS FOR GOAL RECALCULATION ───────────────────────────────────────────

async def recalculate_goal_co2_and_status(goal_id: str) -> None:
    """
    Recalculates currentCo2 and status for a specific EnvironmentalGoal
    based on the sum of carbon transactions for its department.
    """
    db = get_client()
    goal = await db.environmentalgoal.find_unique(where={"id": goal_id})
    if not goal:
        return

    # Sum all carbon transactions for the goal's department
    # Note: If there's a timeframe, we could filter here. Currently summing all.
    aggregations = await db.carbontransaction.group_by(
        by=["departmentId"],
        sum={"co2Calculated": True},
        where={"departmentId": goal.departmentId}
    )

    total_co2 = 0.0
    if aggregations:
        total_co2 = aggregations[0].get("_sum", {}).get("co2Calculated") or 0.0

    # Calculate progress
    progress_pct = (total_co2 / goal.targetCo2 * 100.0) if goal.targetCo2 > 0 else 0.0

    # Auto status transitions
    new_status = GoalStatus.ACTIVE
    if progress_pct >= 100.0:
        new_status = GoalStatus.COMPLETED
    elif progress_pct >= 70.0:
        new_status = GoalStatus.ON_TRACK
    else:
        # Check if deadline is within 30 days and not completed
        now = datetime.now(timezone.utc)
        deadline_utc = goal.deadline.replace(tzinfo=timezone.utc) if goal.deadline.tzinfo is None else goal.deadline
        if deadline_utc - now < timedelta(days=30):
            new_status = GoalStatus.AT_RISK

    await db.environmentalgoal.update(
        where={"id": goal_id},
        data={
            "currentCo2": total_co2,
            "status": new_status
        }
    )

async def recalculate_department_goals(department_id: str) -> None:
    """Recalculates all goals linked to a specific department."""
    db = get_client()
    goals = await db.environmentalgoal.find_many(where={"departmentId": department_id})
    for goal in goals:
        await recalculate_goal_co2_and_status(goal.id)


# ── EMISSION FACTORS ──────────────────────────────────────────────────────────

@router.get("/emission-factors", response_model=PaginatedResponse[EmissionFactorResponse])
async def list_emission_factors(
    user: ManagerOrAdminUser,
    activity_type: Optional[str] = Query(None, alias="activityType"),
    source: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    db = get_client()
    where = {}
    if activity_type:
        where["activityType"] = {"contains": activity_type, "mode": "insensitive"}
    if source:
        where["source"] = {"contains": source, "mode": "insensitive"}

    total = await db.emissionfactor.count(where=where)
    items = await db.emissionfactor.find_many(
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

@router.post("/emission-factors", response_model=EmissionFactorResponse, status_code=status.HTTP_201_CREATED)
async def create_emission_factor(body: EmissionFactorCreate, admin: AdminUser):
    db = get_client()
    item = await db.emissionfactor.create(
        data={
            "activityType": body.activityType,
            "unit": body.unit,
            "co2PerUnit": body.co2PerUnit,
            "source": body.source,
            "effectiveDate": body.effectiveDate,
        }
    )
    return item

@router.get("/emission-factors/{id}", response_model=EmissionFactorResponse)
async def get_emission_factor(id: str, user: ManagerOrAdminUser):
    db = get_client()
    item = await db.emissionfactor.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Emission factor not found")
    return item

@router.put("/emission-factors/{id}", response_model=EmissionFactorResponse)
async def update_emission_factor(id: str, body: EmissionFactorUpdate, admin: AdminUser):
    db = get_client()
    item = await db.emissionfactor.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Emission factor not found")

    update_data = body.model_dump(exclude_unset=True)
    updated = await db.emissionfactor.update(
        where={"id": id},
        data=update_data
    )
    return updated

@router.delete("/emission-factors/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_emission_factor(id: str, admin: AdminUser):
    db = get_client()
    item = await db.emissionfactor.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Emission factor not found")
    await db.emissionfactor.delete(where={"id": id})
    return None


# ── PRODUCT ESG PROFILES ──────────────────────────────────────────────────────

@router.get("/product-esg-profiles", response_model=PaginatedResponse[ProductEsgProfileResponse])
async def list_product_esg_profiles(
    user: ManagerOrAdminUser,
    sku: Optional[str] = None,
    product_name: Optional[str] = Query(None, alias="productName"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    db = get_client()
    where = {}
    if sku:
        where["sku"] = {"contains": sku, "mode": "insensitive"}
    if product_name:
        where["productName"] = {"contains": product_name, "mode": "insensitive"}

    total = await db.productesgprofile.count(where=where)
    items = await db.productesgprofile.find_many(
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

@router.post("/product-esg-profiles", response_model=ProductEsgProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_product_esg_profile(body: ProductEsgProfileCreate, admin: AdminUser):
    db = get_client()
    existing = await db.productesgprofile.find_unique(where={"sku": body.sku})
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    item = await db.productesgprofile.create(
        data={
            "productName": body.productName,
            "sku": body.sku,
            "carbonFootprint": body.carbonFootprint,
            "recyclablePct": body.recyclablePct,
            "notes": body.notes,
        }
    )
    return item

@router.get("/product-esg-profiles/{id}", response_model=ProductEsgProfileResponse)
async def get_product_esg_profile(id: str, user: ManagerOrAdminUser):
    db = get_client()
    item = await db.productesgprofile.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Product ESG profile not found")
    return item

@router.put("/product-esg-profiles/{id}", response_model=ProductEsgProfileResponse)
async def update_product_esg_profile(id: str, body: ProductEsgProfileUpdate, admin: AdminUser):
    db = get_client()
    item = await db.productesgprofile.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Product ESG profile not found")

    update_data = body.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != item.sku:
        existing = await db.productesgprofile.find_unique(where={"sku": update_data["sku"]})
        if existing:
            raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    updated = await db.productesgprofile.update(
        where={"id": id},
        data=update_data
    )
    return updated

@router.delete("/product-esg-profiles/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_esg_profile(id: str, admin: AdminUser):
    db = get_client()
    item = await db.productesgprofile.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Product ESG profile not found")
    await db.productesgprofile.delete(where={"id": id})
    return None


# ── CARBON TRANSACTIONS ──────────────────────────────────────────────────────

@router.get("/carbon-transactions", response_model=PaginatedResponse[CarbonTransactionResponse])
async def list_carbon_transactions(
    user: ManagerOrAdminUser,
    dept_id: Optional[str] = Query(None, alias="departmentId"),
    source_type: Optional[SourceType] = Query(None, alias="sourceType"),
    from_date: Optional[datetime] = Query(None, alias="fromDate"),
    to_date: Optional[datetime] = Query(None, alias="toDate"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    db = get_client()
    allowed_depts = await get_dept_scope(user)

    where = {}

    # Department scoping check
    if user.role != "ADMIN":
        # Managers can only see transactions within their dept scope
        if dept_id:
            if dept_id not in allowed_depts:
                raise HTTPException(status_code=403, detail="Access denied to requested department")
            where["departmentId"] = dept_id
        else:
            where["departmentId"] = {"in": allowed_depts}
    else:
        # Admins can query any
        if dept_id:
            where["departmentId"] = dept_id

    if source_type:
        where["sourceType"] = source_type

    if from_date or to_date:
        created_at_filter = {}
        if from_date:
            created_at_filter["gte"] = from_date
        if to_date:
            created_at_filter["lte"] = to_date
        where["createdAt"] = created_at_filter

    total = await db.carbontransaction.count(where=where)
    items = await db.carbontransaction.find_many(
        where=where,
        take=page_size,
        skip=(page - 1) * page_size,
        include={
            "department": True,
            "emissionFactor": True,
            "productEsgProfile": True,
        },
        order={"createdAt": "desc"}
    )

    response_items = []
    for it in items:
        response_items.append(
            CarbonTransactionResponse(
                id=it.id,
                departmentId=it.departmentId,
                departmentName=it.department.name if it.department else None,
                sourceType=it.sourceType,
                sourceRecordId=it.sourceRecordId,
                emissionFactorId=it.emissionFactorId,
                emissionFactorName=it.emissionFactor.activityType if it.emissionFactor else None,
                productEsgProfileId=it.productEsgProfileId,
                productName=it.productEsgProfile.productName if it.productEsgProfile else None,
                quantity=it.quantity,
                co2Calculated=it.co2Calculated,
                autoGenerated=it.autoGenerated,
                anomalyFlag=it.anomalyFlag,
                createdById=it.createdById,
                createdAt=it.createdAt,
            )
        )

    return PaginatedResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("/carbon-transactions", response_model=CarbonTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_carbon_transaction(body: CarbonTransactionCreate, user: ManagerOrAdminUser):
    db = get_client()

    # Enforce department scoping for Managers
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if body.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Cannot create transaction for this department")

    # Verify department exists
    dept = await db.department.find_unique(where={"id": body.departmentId})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    # Compute carbon emissions based on pathways
    co2_calculated = 0.0
    auto_generated = False

    # Get master configuration (we will implement the toggle later in Settings, let's default to True for now)
    # If the user provides a factor or product profile, we attempt auto-calc.
    if body.emissionFactorId:
        factor = await db.emissionfactor.find_unique(where={"id": body.emissionFactorId})
        if not factor:
            raise HTTPException(status_code=404, detail="Emission factor not found")
        co2_calculated = body.quantity * factor.co2PerUnit
        auto_generated = True
    elif body.productEsgProfileId:
        profile = await db.productesgprofile.find_unique(where={"id": body.productEsgProfileId})
        if not profile:
            raise HTTPException(status_code=404, detail="Product ESG profile not found")
        co2_calculated = body.quantity * profile.carbonFootprint
        auto_generated = True
    else:
        # No auto-calc profile/factor provided. Check if we accept manual co2 entry.
        if body.co2Calculated is not None:
            co2_calculated = body.co2Calculated
        else:
            raise HTTPException(
                status_code=400,
                detail="Must specify either emissionFactorId, productEsgProfileId, or manual co2Calculated value"
            )

    item = await db.carbontransaction.create(
        data={
            "departmentId": body.departmentId,
            "sourceType": body.sourceType,
            "sourceRecordId": body.sourceRecordId,
            "emissionFactorId": body.emissionFactorId,
            "productEsgProfileId": body.productEsgProfileId,
            "quantity": body.quantity,
            "co2Calculated": co2_calculated,
            "autoGenerated": auto_generated,
            "createdById": user.id,
        },
        include={
            "department": True,
            "emissionFactor": True,
            "productEsgProfile": True,
        }
    )

    # Trigger goal updates for this department
    await recalculate_department_goals(body.departmentId)

    return CarbonTransactionResponse(
        id=item.id,
        departmentId=item.departmentId,
        departmentName=item.department.name if item.department else None,
        sourceType=item.sourceType,
        sourceRecordId=item.sourceRecordId,
        emissionFactorId=item.emissionFactorId,
        emissionFactorName=item.emissionFactor.activityType if item.emissionFactor else None,
        productEsgProfileId=item.productEsgProfileId,
        productName=item.productEsgProfile.productName if item.productEsgProfile else None,
        quantity=item.quantity,
        co2Calculated=item.co2Calculated,
        autoGenerated=item.autoGenerated,
        anomalyFlag=item.anomalyFlag,
        createdById=item.createdById,
        createdAt=item.createdAt,
    )

@router.put("/carbon-transactions/{id}", response_model=CarbonTransactionResponse)
async def update_carbon_transaction(id: str, body: CarbonTransactionUpdate, user: ManagerOrAdminUser):
    db = get_client()
    item = await db.carbontransaction.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Carbon transaction not found")

    # Scoping check
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if item.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to this transaction")
        # If updating department, check the new department too
        if body.departmentId and body.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Cannot assign transaction to this department")

    old_dept_id = item.departmentId
    update_data = body.model_dump(exclude_unset=True)

    # Recalculate co2 if quantity, factor, or profile changes
    recalc_co2 = False
    qty = body.quantity if body.quantity is not None else item.quantity
    factor_id = body.emissionFactorId if body.emissionFactorId is not None else item.emissionFactorId
    profile_id = body.productEsgProfileId if body.productEsgProfileId is not None else item.productEsgProfileId

    if (body.quantity is not None) or (body.emissionFactorId is not None) or (body.productEsgProfileId is not None):
        recalc_co2 = True

    if recalc_co2:
        if factor_id:
            factor = await db.emissionfactor.find_unique(where={"id": factor_id})
            if not factor:
                raise HTTPException(status_code=404, detail="Emission factor not found")
            update_data["co2Calculated"] = qty * factor.co2PerUnit
            update_data["autoGenerated"] = True
        elif profile_id:
            profile = await db.productesgprofile.find_unique(where={"id": profile_id})
            if not profile:
                raise HTTPException(status_code=404, detail="Product ESG profile not found")
            update_data["co2Calculated"] = qty * profile.carbonFootprint
            update_data["autoGenerated"] = True
        elif body.co2Calculated is not None:
            update_data["co2Calculated"] = body.co2Calculated
            update_data["autoGenerated"] = False

    updated = await db.carbontransaction.update(
        where={"id": id},
        data=update_data,
        include={
            "department": True,
            "emissionFactor": True,
            "productEsgProfile": True,
        }
    )

    # Recalculate goals for old and new department
    await recalculate_department_goals(old_dept_id)
    if updated.departmentId != old_dept_id:
        await recalculate_department_goals(updated.departmentId)

    return CarbonTransactionResponse(
        id=updated.id,
        departmentId=updated.departmentId,
        departmentName=updated.department.name if updated.department else None,
        sourceType=updated.sourceType,
        sourceRecordId=updated.sourceRecordId,
        emissionFactorId=updated.emissionFactorId,
        emissionFactorName=updated.emissionFactor.activityType if updated.emissionFactor else None,
        productEsgProfileId=updated.productEsgProfileId,
        productName=updated.productEsgProfile.productName if updated.productEsgProfile else None,
        quantity=updated.quantity,
        co2Calculated=updated.co2Calculated,
        autoGenerated=updated.autoGenerated,
        anomalyFlag=updated.anomalyFlag,
        createdById=updated.createdById,
        createdAt=updated.createdAt,
    )

@router.delete("/carbon-transactions/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_carbon_transaction(id: str, admin: AdminUser):
    db = get_client()
    item = await db.carbontransaction.find_unique(where={"id": id})
    if not item:
        raise HTTPException(status_code=404, detail="Carbon transaction not found")

    await db.carbontransaction.delete(where={"id": id})

    # Update goals for the department
    await recalculate_department_goals(item.departmentId)
    return None


# ── ENVIRONMENTAL GOALS ──────────────────────────────────────────────────────

@router.get("/environmental-goals", response_model=PaginatedResponse[EnvironmentalGoalResponse])
async def list_environmental_goals(
    user: CurrentUser,
    dept_id: Optional[str] = Query(None, alias="departmentId"),
    status_filter: Optional[GoalStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    db = get_client()
    where = {}

    # Employee: view own department goals only
    # Manager: view own department scope goals
    # Admin: view all
    if user.role == "ADMIN":
        if dept_id:
            where["departmentId"] = dept_id
    elif user.role == "DEPARTMENT_MANAGER":
        allowed_depts = await get_dept_scope(user)
        if dept_id:
            if dept_id not in allowed_depts:
                raise HTTPException(status_code=403, detail="Access denied to requested department")
            where["departmentId"] = dept_id
        else:
            where["departmentId"] = {"in": allowed_depts}
    else:  # EMPLOYEE
        if not user.departmentId:
            # Employee doesn't have a department assigned, return empty list
            return PaginatedResponse(items=[], total=0, page=page, page_size=page_size)
        where["departmentId"] = user.departmentId

    if status_filter:
        where["status"] = status_filter

    total = await db.environmentalgoal.count(where=where)
    goals = await db.environmentalgoal.find_many(
        where=where,
        take=page_size,
        skip=(page - 1) * page_size,
        include={"department": True},
        order={"deadline": "asc"}
    )

    # Sync and calculate progress percentages dynamically
    response_items = []
    for g in goals:
        # Trigger recalculation to ensure DB and response are in sync
        await recalculate_goal_co2_and_status(g.id)
        # Fetch updated version
        updated_g = await db.environmentalgoal.find_unique(where={"id": g.id}, include={"department": True})

        progress_pct = (updated_g.currentCo2 / updated_g.targetCo2 * 100.0) if updated_g.targetCo2 > 0 else 0.0
        response_items.append(
            EnvironmentalGoalResponse(
                id=updated_g.id,
                departmentId=updated_g.departmentId,
                departmentName=updated_g.department.name if updated_g.department else None,
                name=updated_g.name,
                targetCo2=updated_g.targetCo2,
                currentCo2=updated_g.currentCo2,
                progressPct=round(progress_pct, 2),
                deadline=updated_g.deadline,
                status=updated_g.status,
                createdAt=updated_g.createdAt,
                updatedAt=updated_g.updatedAt,
            )
        )

    return PaginatedResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("/environmental-goals", response_model=EnvironmentalGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_environmental_goal(body: EnvironmentalGoalCreate, user: ManagerOrAdminUser):
    db = get_client()

    # Enforce department scope
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if body.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Cannot create goal for this department")

    dept = await db.department.find_unique(where={"id": body.departmentId})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    goal = await db.environmentalgoal.create(
        data={
            "departmentId": body.departmentId,
            "name": body.name,
            "targetCo2": body.targetCo2,
            "deadline": body.deadline,
            "status": GoalStatus.ACTIVE,
        },
        include={"department": True}
    )

    # Initial recalculation
    await recalculate_goal_co2_and_status(goal.id)
    # Refetch
    updated = await db.environmentalgoal.find_unique(where={"id": goal.id}, include={"department": True})
    progress_pct = (updated.currentCo2 / updated.targetCo2 * 100.0) if updated.targetCo2 > 0 else 0.0

    return EnvironmentalGoalResponse(
        id=updated.id,
        departmentId=updated.departmentId,
        departmentName=updated.department.name if updated.department else None,
        name=updated.name,
        targetCo2=updated.targetCo2,
        currentCo2=updated.currentCo2,
        progressPct=round(progress_pct, 2),
        deadline=updated.deadline,
        status=updated.status,
        createdAt=updated.createdAt,
        updatedAt=updated.updatedAt,
    )

@router.get("/environmental-goals/{id}", response_model=EnvironmentalGoalResponse)
async def get_environmental_goal(id: str, user: CurrentUser):
    db = get_client()
    goal = await db.environmentalgoal.find_unique(where={"id": id}, include={"department": True})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Scoping checks
    if user.role == "DEPARTMENT_MANAGER":
        allowed_depts = await get_dept_scope(user)
        if goal.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to this goal")
    elif user.role == "EMPLOYEE":
        if goal.departmentId != user.departmentId:
            raise HTTPException(status_code=403, detail="Access denied to this goal")

    await recalculate_goal_co2_and_status(goal.id)
    updated = await db.environmentalgoal.find_unique(where={"id": goal.id}, include={"department": True})
    progress_pct = (updated.currentCo2 / updated.targetCo2 * 100.0) if updated.targetCo2 > 0 else 0.0

    return EnvironmentalGoalResponse(
        id=updated.id,
        departmentId=updated.departmentId,
        departmentName=updated.department.name if updated.department else None,
        name=updated.name,
        targetCo2=updated.targetCo2,
        currentCo2=updated.currentCo2,
        progressPct=round(progress_pct, 2),
        deadline=updated.deadline,
        status=updated.status,
        createdAt=updated.createdAt,
        updatedAt=updated.updatedAt,
    )

@router.put("/environmental-goals/{id}", response_model=EnvironmentalGoalResponse)
async def update_environmental_goal(id: str, body: EnvironmentalGoalUpdate, user: ManagerOrAdminUser):
    db = get_client()
    goal = await db.environmentalgoal.find_unique(where={"id": id})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Scoping checks
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if goal.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to this goal")
        if body.departmentId and body.departmentId not in allowed_depts:
            raise HTTPException(status_code=403, detail="Cannot assign goal to this department")

    update_data = body.model_dump(exclude_unset=True)
    updated = await db.environmentalgoal.update(
        where={"id": id},
        data=update_data,
        include={"department": True}
    )

    await recalculate_goal_co2_and_status(updated.id)
    refetched = await db.environmentalgoal.find_unique(where={"id": updated.id}, include={"department": True})
    progress_pct = (refetched.currentCo2 / refetched.targetCo2 * 100.0) if refetched.targetCo2 > 0 else 0.0

    return EnvironmentalGoalResponse(
        id=refetched.id,
        departmentId=refetched.departmentId,
        departmentName=refetched.department.name if refetched.department else None,
        name=refetched.name,
        targetCo2=refetched.targetCo2,
        currentCo2=refetched.currentCo2,
        progressPct=round(progress_pct, 2),
        deadline=refetched.deadline,
        status=refetched.status,
        createdAt=refetched.createdAt,
        updatedAt=refetched.updatedAt,
    )

@router.delete("/environmental-goals/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_environmental_goal(id: str, admin: AdminUser):
    db = get_client()
    goal = await db.environmentalgoal.find_unique(where={"id": id})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.environmentalgoal.delete(where={"id": id})
    return None


# ── ENVIRONMENTAL SCORE (feeds Dashboard) ───────────────────────────────────

@router.get("/scores/environmental", response_model=EnvironmentalScoreResponse)
async def get_environmental_score(
    user: ManagerOrAdminUser,
    dept_id: Optional[str] = Query(None, alias="departmentId"),
    period_start: Optional[datetime] = Query(None, alias="periodStart"),
    period_end: Optional[datetime] = Query(None, alias="periodEnd"),
):
    """
    Computes environmental score for a department.
    Score = average(progress_pct) across all non-COMPLETED goals for the department, clamped to [0, 100].
    """
    db = get_client()

    target_dept_id = dept_id
    if user.role != "ADMIN":
        allowed_depts = await get_dept_scope(user)
        if not target_dept_id:
            target_dept_id = user.departmentId
        if not target_dept_id or target_dept_id not in allowed_depts:
            raise HTTPException(status_code=403, detail="Access denied to requested department")
    else:
        if not target_dept_id:
            raise HTTPException(status_code=400, detail="departmentId is required for admin queries")

    # Find goals for this department
    where = {"departmentId": target_dept_id}
    if period_start or period_end:
        deadline_filter = {}
        if period_start:
            deadline_filter["gte"] = period_start
        if period_end:
            deadline_filter["lte"] = period_end
        where["deadline"] = deadline_filter

    goals = await db.environmentalgoal.find_many(where=where)

    score = 0.0
    non_completed_goals = [g for g in goals if g.status != GoalStatus.COMPLETED]
    goal_count = len(non_completed_goals)

    if goal_count > 0:
        total_progress = 0.0
        for g in non_completed_goals:
            # Sync goal co2
            await recalculate_goal_co2_and_status(g.id)
            refetched = await db.environmentalgoal.find_unique(where={"id": g.id})
            progress_pct = (refetched.currentCo2 / refetched.targetCo2 * 100.0) if refetched.targetCo2 > 0 else 0.0
            total_progress += min(progress_pct, 100.0)  # clamp individual progress pct to 100
        score = total_progress / goal_count

    return EnvironmentalScoreResponse(
        departmentId=target_dept_id,
        score=round(score, 2),
        goalCount=goal_count,
        periodStart=period_start or datetime.now(timezone.utc) - timedelta(days=365),
        periodEnd=period_end or datetime.now(timezone.utc)
    )
