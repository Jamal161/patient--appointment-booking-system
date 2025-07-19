from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.report import Report
from models.appointment import Appointment, AppointmentStatus
from models.user import User
from datetime import datetime
from sqlalchemy import func

class ReportController:
    @staticmethod
    def generate_monthly_report(db: Session, year: int, month: int):
        # Validate year and month
        if not (1 <= month <= 12):
            raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        if year < 1900 or year > 9999:
            raise HTTPException(status_code=400, detail="Year must be between 1900 and 9999")
        
        try:
            start_date = datetime(year, month, 1)
            end_date = datetime(year, month + 1, 1) if month < 12 else datetime(year + 1, 1, 1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid year or month")
        
        doctors = db.query(User).filter(User.user_type == "doctor").all()
        reports = []
        
        for doctor in doctors:
            appointments = db.query(Appointment).filter(
                Appointment.doctor_id == doctor.id,
                Appointment.status == AppointmentStatus.completed,
                Appointment.appointment_datetime >= start_date,
                Appointment.appointment_datetime < end_date
            ).all()
            
            total_patients = len(set(a.patient_id for a in appointments))
            total_appointments = len(appointments)
            total_earnings = sum(doctor.consultation_fee for _ in appointments)
            
            report = Report(
                doctor_id=doctor.id,
                month=f"{year}-{month:02d}",
                total_patients=total_patients,
                total_appointments=total_appointments,
                total_earnings=total_earnings
            )
            db.add(report)
            reports.append(report)
        
        db.commit()
        return reports