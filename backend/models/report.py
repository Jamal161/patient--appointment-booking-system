from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from utils.database import Base
from datetime import datetime

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    month = Column(String, nullable=False)
    total_patients = Column(Integer)
    total_appointments = Column(Integer)
    total_earnings = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    doctor = relationship("User", lazy="select")
    
    def __repr__(self):
        return f"<Report(id={self.id}, doctor_id={self.doctor_id}, month='{self.month}')>"