from sqlalchemy import Column, Integer, DateTime, String, Enum, ForeignKey, ARRAY, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from utils.database import Base
from models.user import AppointmentStatus
from datetime import datetime

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    appointment_datetime = Column(DateTime, nullable=False)
    notes = Column(String)
    status = Column(Enum(AppointmentStatus, name="appointmentstatus", create_type=False), 
                   default=AppointmentStatus.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], lazy="select")
    doctor = relationship("User", foreign_keys=[doctor_id], lazy="select")
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, patient_id={self.patient_id}, doctor_id={self.doctor_id}, status='{self.status}')>"