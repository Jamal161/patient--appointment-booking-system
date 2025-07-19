from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException
from models.appointment import Appointment, AppointmentStatus
from models.user import User, UserType
from schemas.appointment_schema import AppointmentCreate, AppointmentFilter
from datetime import datetime, timedelta
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class AppointmentController:
    @staticmethod
    def create_appointment(db: Session, appointment: AppointmentCreate, patient_id: int):
        appointment_datetime = appointment.appointment_datetime
        
        # Check if doctor exists and is actually a doctor
        doctor = db.query(User).filter(
            User.id == appointment.doctor_id, 
            User.user_type == UserType.doctor
        ).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        # Check doctor availability for the requested datetime
        appointment_hour = appointment_datetime.hour
        
        # Check if the time falls within any of the doctor's available slots
        is_available = False
        if doctor.available_timeslots:
            for slot in doctor.available_timeslots:
                # Ensure the slot is a string before attempting to split
                if isinstance(slot, str):
                    try:
                        slot_datetime = datetime.strptime(slot, '%Y-%m-%d %H:%M:%S')
                        # Check if appointment time matches available slot (within 1 hour window)
                        time_diff = abs((appointment_datetime - slot_datetime).total_seconds())
                        if time_diff <= 3600:  # Within 1 hour
                            is_available = True
                            break
                    except ValueError:
                        continue
        
        if not is_available:
            raise HTTPException(
                status_code=400, 
                detail=f"Doctor is not available at {appointment_datetime.strftime('%Y-%m-%d %H:%M:%S')}. Available slots: {doctor.available_timeslots}"
            )
        
        # Check for conflicting appointments
        existing_appointment = db.query(Appointment).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.appointment_datetime == appointment_datetime,
            Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed])
        ).first()
        
        if existing_appointment:
            raise HTTPException(status_code=400, detail="This time slot is already booked")
        
        # Create appointment
        db_appointment = Appointment(
            **appointment.dict(),
            patient_id=patient_id,
            status=AppointmentStatus.pending
        )
        
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        
        # Load relationships
        db_appointment.patient = db.query(User).filter(User.id == patient_id).first()
        db_appointment.doctor = doctor
        
        return db_appointment

    @staticmethod
    def get_appointments(db: Session, filters: AppointmentFilter, user_id: int = None, user_type: str = None):
        query = db.query(Appointment)
        
        # Apply user-specific filters
        if user_type == UserType.patient.value and user_id:
            query = query.filter(Appointment.patient_id == user_id)
        elif user_type == UserType.doctor.value and user_id:
            query = query.filter(Appointment.doctor_id == user_id)
        # Admin can see all appointments (no additional filter)
        
        # Apply other filters
        if filters.status:
            query = query.filter(Appointment.status == filters.status)
        
        if filters.doctor_id:
            query = query.filter(Appointment.doctor_id == filters.doctor_id)
        
        if filters.patient_id:
            query = query.filter(Appointment.patient_id == filters.patient_id)
        
        if filters.date_from:
            query = query.filter(Appointment.appointment_datetime >= filters.date_from)
        
        if filters.date_to:
            # Add one day to include the entire end date
            end_date = filters.date_to + timedelta(days=1)
            query = query.filter(Appointment.appointment_datetime < end_date)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        appointments = query.order_by(Appointment.appointment_datetime.desc())\
                          .offset(filters.skip)\
                          .limit(filters.limit)\
                          .all()
        
        # Load relationships
        for appointment in appointments:
            appointment.patient = db.query(User).filter(User.id == appointment.patient_id).first()
            appointment.doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
        
        return {
            "appointments": appointments,
            "total": total,
            "skip": filters.skip,
            "limit": filters.limit
        }

    @staticmethod
    def update_appointment_status(db: Session, appointment_id: int, status: str, user_id: int, user_type: str):
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Authorization checks
        if user_type == UserType.patient.value:
            # Patients can only cancel their own pending appointments
            if appointment.patient_id != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to modify this appointment")
            if status not in [AppointmentStatus.cancelled.value]:
                raise HTTPException(status_code=403, detail="Patients can only cancel appointments")
            if appointment.status != AppointmentStatus.pending:
                raise HTTPException(status_code=400, detail="Can only cancel pending appointments")
        
        elif user_type == UserType.doctor.value:
            # Doctors can manage appointments assigned to them
            if appointment.doctor_id != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to modify this appointment")
            if status not in [AppointmentStatus.confirmed.value, AppointmentStatus.completed.value, AppointmentStatus.cancelled.value]:
                raise HTTPException(status_code=403, detail="Invalid status for doctor")
        
        # Admin can change any appointment status
        
        # Validate status transitions
        valid_transitions = {
            AppointmentStatus.pending: [AppointmentStatus.confirmed, AppointmentStatus.cancelled],
            AppointmentStatus.confirmed: [AppointmentStatus.completed, AppointmentStatus.cancelled],
            AppointmentStatus.cancelled: [],  # Cannot change from cancelled
            AppointmentStatus.completed: []   # Cannot change from completed
        }
        
        try:
            new_status = AppointmentStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status value")
        
        if new_status not in valid_transitions.get(appointment.status, []):
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot change status from {appointment.status.value} to {status}"
            )
        
        appointment.status = new_status
        db.commit()
        db.refresh(appointment)
        
        # Load relationships
        appointment.patient = db.query(User).filter(User.id == appointment.patient_id).first()
        appointment.doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
        
        return appointment

    @staticmethod
    def get_appointment_by_id(db: Session, appointment_id: int, user_id: int = None, user_type: str = None):
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Authorization check
        if user_type == UserType.patient.value and appointment.patient_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
        elif user_type == UserType.doctor.value and appointment.doctor_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
        
        # Load relationships
        appointment.patient = db.query(User).filter(User.id == appointment.patient_id).first()
        appointment.doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
        
        return appointment

    @staticmethod
    def get_upcoming_appointments(db: Session, user_id: int, user_type: str):
        """Get upcoming appointments for reminders"""
        tomorrow = datetime.utcnow() + timedelta(days=1)
        day_after_tomorrow = tomorrow + timedelta(days=1)
        
        query = db.query(Appointment).filter(
            Appointment.appointment_datetime >= tomorrow,
            Appointment.appointment_datetime < day_after_tomorrow,
            Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed])
        )
        
        if user_type == UserType.patient.value:
            query = query.filter(Appointment.patient_id == user_id)
        elif user_type == UserType.doctor.value:
            query = query.filter(Appointment.doctor_id == user_id)
        
        appointments = query.all()
        
        # Load relationships
        for appointment in appointments:
            appointment.patient = db.query(User).filter(User.id == appointment.patient_id).first()
            appointment.doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
        
        return appointments