from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.report_schema import ReportResponse
from controllers.report_controller import ReportController
from utils.database import get_db
from utils.auth import get_current_user
from schemas.user_schema import UserResponse
from typing import List

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/generate/{year}/{month}", response_model=List[ReportResponse])
def generate_monthly_report(year: int, month: int,
                          current_user: UserResponse = Depends(get_current_user),
                          db: Session = Depends(get_db)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return ReportController.generate_monthly_report(db, year, month)