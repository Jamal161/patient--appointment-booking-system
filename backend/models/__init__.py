# Import all models to ensure they're registered with SQLAlchemy
from utils.database import Base
from .user import User, UserType, AppointmentStatus
from .appointment import Appointment
from .report import Report

# Make sure all models are available
__all__ = ['Base', 'User', 'UserType', 'AppointmentStatus', 'Appointment', 'Report']