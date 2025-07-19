from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum
from .user_schema import UserResponse

class AppointmentStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"

class AppointmentBase(BaseModel):
    doctor_id: int
    appointment_datetime: datetime
    notes: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True

class AppointmentCreate(AppointmentBase):
    @validator('appointment_datetime')
    def validate_appointment_datetime(cls, v):
        if v <= datetime.utcnow():
            raise ValueError('Appointment cannot be scheduled in the past')
        
        # Check if appointment is within business hours (9 AM to 6 PM)
        if v.hour < 9 or v.hour >= 18:
            raise ValueError('Appointments can only be scheduled between 9 AM and 6 PM')
        
        # Check if appointment is not on Sunday (assuming Sunday = 6)
        if v.weekday() == 6:
            raise ValueError('Appointments cannot be scheduled on Sundays')
        
        return v

class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    status: AppointmentStatus
    created_at: datetime
    patient: Optional[UserResponse] = None
    doctor: Optional[UserResponse] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

class AppointmentFilter(BaseModel):
    status: Optional[str] = None
    doctor_id: Optional[int] = None
    patient_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    skip: int = 0
    limit: int = 10