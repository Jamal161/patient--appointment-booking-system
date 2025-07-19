from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from models.user import User, UserType
from schemas.user_schema import UserCreate, UserResponse, UserUpdateRequest
from fastapi import HTTPException, UploadFile
from utils.auth import get_password_hash, verify_password
from typing import List, Optional
import os
import logging
from PIL import Image
import uuid

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class UserController:
    @staticmethod
    def create_user(db: Session, user: UserCreate):
        logger.debug(f"Creating user: {user.email}")
        
        # Check unique email/mobile
        existing_user = db.query(User).filter(
            or_(User.email == user.email, User.mobile_number == user.mobile_number)
        ).first()
        
        if existing_user:
            if existing_user.email == user.email:
                raise HTTPException(status_code=400, detail="Email already registered")
            else:
                raise HTTPException(status_code=400, detail="Mobile number already registered")
        
        # Validate doctor-specific fields
        if user.user_type == UserType.doctor.value:
            if not all([user.license_number, user.experience_years is not None, 
                       user.consultation_fee is not None]):
                raise HTTPException(
                    status_code=400, 
                    detail="License number, experience years, and consultation fee are required for doctors"
                )
        
        # Create user
        db_user = User(
            **user.dict(exclude={'password'}),
            password=get_password_hash(user.password)
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 10, 
                  user_type: Optional[str] = None, 
                  specialization: Optional[str] = None,
                  division: Optional[str] = None,
                  search: Optional[str] = None):
        
        query = db.query(User)
        
        # Apply filters
        if user_type:
            query = query.filter(User.user_type == user_type)
        
        if specialization:
            query = query.filter(User.specialization.ilike(f"%{specialization}%"))
        
        if division:
            query = query.filter(User.address_division.ilike(f"%{division}%"))
        
        if search:
            query = query.filter(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                    User.mobile_number.ilike(f"%{search}%")
                )
            )
        
        # Apply pagination
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        
        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdateRequest):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password):
            return None
        return user

    @staticmethod
    def get_doctors_by_availability(db: Session, date: str, time_slot:str):
        """Get available doctors for a specific date (time_slot not required)"""
        doctors = db.query(User).filter(
            User.user_type == UserType.doctor
        ).all()
        return doctors

    @staticmethod
    def upload_profile_image(db: Session, user_id: int, file: UploadFile):
        """Handle profile image upload with validation"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Only JPEG and PNG files are allowed")
        
        # Validate file size (5MB max)
        if file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/profile_images"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Update user profile
        user.profile_image = file_path
        db.commit()
        
        return {"message": "Profile image uploaded successfully", "file_path": file_path}