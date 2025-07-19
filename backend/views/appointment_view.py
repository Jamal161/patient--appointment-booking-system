from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from schemas.appointment_schema import (
    AppointmentCreate, AppointmentResponse, AppointmentStatusUpdate, AppointmentFilter
)
from controllers.appointment_controller import AppointmentController
from utils.database import get_db
from utils.auth import get_current_user
from schemas.user_schema import UserResponse
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appointment: AppointmentCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new appointment (Patients only)"""
    if current_user.user_type != "patient":
        raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can book appointments"
)
    
    return AppointmentController.create_appointment(db, appointment, current_user.id)

@router.get("/", response_model=dict)
def get_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, regex="^(pending|confirmed|cancelled|completed)$"),
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get appointments with filtering and pagination"""
    
    filters = AppointmentFilter(
        status=status,
        doctor_id=doctor_id,
        patient_id=patient_id,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )
    
    result = AppointmentController.get_appointments(
        db, filters, current_user.id, current_user.user_type
    )
    
    return {
        "appointments": [AppointmentResponse.from_orm(apt) for apt in result["appointments"]],
        "total": result["total"],
        "skip": result["skip"],
        "limit": result["limit"]
    }

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get appointment by ID"""
    return AppointmentController.get_appointment_by_id(
        db, appointment_id, current_user.id, current_user.user_type
    )

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    status_update: AppointmentStatusUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update appointment status"""
    return AppointmentController.update_appointment_status(
        db, appointment_id, status_update.status.value, current_user.id, current_user.user_type
    )

@router.get("/my/upcoming", response_model=List[AppointmentResponse])
def get_my_upcoming_appointments(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's upcoming appointments"""
    appointments = AppointmentController.get_upcoming_appointments(
        db, current_user.id, current_user.user_type
    )
    return [AppointmentResponse.from_orm(apt) for apt in appointments]

@router.get("/today/all", response_model=List[AppointmentResponse])
def get_todays_appointments(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's appointments (for dashboard)"""
    today = datetime.utcnow().date()
    filters = AppointmentFilter(
        date_from=datetime.combine(today, datetime.min.time()),
        date_to=datetime.combine(today, datetime.max.time()),
        skip=0,
        limit=100
    )
    
    result = AppointmentController.get_appointments(
        db, filters, current_user.id, current_user.user_type
    )
    
    return [AppointmentResponse.from_orm(apt) for apt in result["appointments"]]

@router.get("/stats/summary")
def get_appointment_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get appointment statistics for dashboard"""
    
    # Get all appointments for the current user
    filters = AppointmentFilter(skip=0, limit=1000)
    result = AppointmentController.get_appointments(
        db, filters, current_user.id, current_user.user_type
    )
    
    appointments = result["appointments"]
    
    # Calculate statistics
    total = len(appointments)
    pending = len([apt for apt in appointments if apt.status.value == "pending"])
    confirmed = len([apt for apt in appointments if apt.status.value == "confirmed"])
    completed = len([apt for apt in appointments if apt.status.value == "completed"])
    cancelled = len([apt for apt in appointments if apt.status.value == "cancelled"])
    
    # Today's appointments
    today = datetime.utcnow().date()
    today_appointments = [
        apt for apt in appointments 
        if apt.appointment_datetime.date() == today
    ]
    
    return {
        "total_appointments": total,
        "pending_appointments": pending,
        "confirmed_appointments": confirmed,
        "completed_appointments": completed,
        "cancelled_appointments": cancelled,
        "todays_appointments": len(today_appointments)
    }