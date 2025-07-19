from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportResponse(BaseModel):
    id: int
    doctor_id: int
    month: str
    total_patients: int
    total_appointments: int
    total_earnings: float
    created_at: datetime
    
    class Config:
        orm_mode = True