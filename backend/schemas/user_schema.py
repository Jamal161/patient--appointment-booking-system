from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
import re

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile_number: str
    address_division: Optional[str] = None
    address_district: Optional[str] = None
    address_thana: Optional[str] = None
    profile_image: Optional[str] = None
    
    @validator('mobile_number')
    def validate_mobile_number(cls, v):
        if not re.match(r"^\+88\d{11}$", v):
            raise ValueError('Mobile number must start with +88 and be exactly 14 digits total')
        return v
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError('Full name cannot be empty')
        return v.strip()

class UserCreate(UserBase):
    password: str
    user_type: str
    # Doctor-specific fields
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    # available_timeslots is NOT required for doctors anymore, so we keep it optional and do not require it
    available_timeslots: Optional[List[str]] = None
    specialization: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('user_type')
    def validate_user_type(cls, v):
        if v not in ['admin', 'doctor', 'patient']:
            raise ValueError('User type must be admin, doctor, or patient')
        return v
    
    @validator('experience_years')
    def validate_experience_years(cls, v, values):
        if values.get('user_type') == 'doctor' and v is None:
            raise ValueError('Experience years is required for doctors')
        if v is not None and v < 0:
            raise ValueError('Experience years cannot be negative')
        return v
    
    @validator('consultation_fee')
    def validate_consultation_fee(cls, v, values):
        if values.get('user_type') == 'doctor' and v is None:
            raise ValueError('Consultation fee is required for doctors')
        if v is not None and v < 0:
            raise ValueError('Consultation fee cannot be negative')
        return v
    
    @validator('license_number')
    def validate_license_number(cls, v, values):
        if values.get('user_type') == 'doctor' and not v:
            raise ValueError('License number is required for doctors')
        return v
    
    @validator('available_timeslots')
    def validate_available_timeslots(cls, v, values):
        # Validate datetime format if provided
        if v:
            for slot in v:
                try:
                    # Validate datetime format: YYYY-MM-DD HH:MM:SS
                    datetime.strptime(slot, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    raise ValueError(f'Invalid timeslot format: {slot}. Use format: YYYY-MM-DD HH:MM:SS')
        return v

class UserResponse(UserBase):
    id: int
    user_type: str
    created_at: datetime
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    available_timeslots: Optional[List[str]] = None
    specialization: Optional[str] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: int

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    address_division: Optional[str] = None
    address_district: Optional[str] = None
    address_thana: Optional[str] = None
    profile_image: Optional[str] = None
    # Doctor fields
    specialization: Optional[str] = None
    consultation_fee: Optional[float] = None
    # available_timeslots is optional and not required
    available_timeslots: Optional[List[str]] = None