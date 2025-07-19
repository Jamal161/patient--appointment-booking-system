from sqlalchemy import Column, Integer, String, Enum, Float, DateTime, ARRAY, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class UserType(enum.Enum):
    admin = "admin"
    doctor = "doctor"
    patient = "patient"

class AppointmentStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile_number = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    user_type = Column(Enum(UserType, name="usertype", create_type=False), nullable=False)
    
    # Address fields
    address_division = Column(String)
    address_district = Column(String)
    address_thana = Column(String)
    
    # Profile
    profile_image = Column(String)
    
    # Doctor-specific fields
    license_number = Column(String)
    experience_years = Column(Integer)
    consultation_fee = Column(Float)
    available_timeslots = Column(ARRAY(String))
    specialization = Column(String)  # Added for filtering
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', user_type='{self.user_type}')>"