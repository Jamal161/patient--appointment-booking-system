from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from schemas.user_schema import UserCreate, UserResponse, LoginRequest, TokenResponse, UserUpdateRequest
from controllers.user_controller import UserController
from utils.database import get_db
from utils.auth import get_current_user, create_access_token
from typing import List, Optional

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (patient, doctor, or admin)"""
    return UserController.create_user(db, user)

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    user = UserController.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user.user_type.value,
        "user_id": user.id
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    return UserController.update_user(db, current_user.id, user_update)

@router.get("/", response_model=dict)
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user_type: Optional[str] = Query(None, regex="^(admin|doctor|patient)$"),
    specialization: Optional[str] = None,
    division: Optional[str] = None,
    search: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get users with filtering and pagination (Admin only for all users, others can see doctors)"""
    
    # Only admins can see all users, others can only see doctors
    if current_user.user_type != "admin" and user_type != "doctor":
        user_type = "doctor"  # Force to show only doctors for non-admin users
    
    result = UserController.get_users(
        db, skip, limit, user_type, specialization, division, search
    )
    
    return {
        "users": [UserResponse.from_orm(user) for user in result["users"]],
        "total": result["total"],
        "skip": result["skip"],
        "limit": result["limit"]
    }

@router.get("/doctors", response_model=dict)
def get_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    specialization: Optional[str] = None,
    division: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get doctors with filtering and pagination (Public endpoint)"""
    result = UserController.get_users(
        db, skip, limit, "doctor", specialization, division, search
    )
    
    return {
        "doctors": [UserResponse.from_orm(user) for user in result["users"]],
        "total": result["total"],
        "skip": result["skip"],
        "limit": result["limit"]
    }

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (Admin only or own profile)"""
    if current_user.user_type != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    return UserController.get_user_by_id(db, user_id)

@router.post("/upload-profile-image")
def upload_profile_image(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile image for current user"""
    return UserController.upload_profile_image(db, current_user.id, file)

@router.get("/doctors/available/{date}")
def get_available_doctors(
    date: str,
    time_slot: Optional[str] = Query(None, description="Time slot in format 'HH:MM - HH:MM'"),
    db: Session = Depends(get_db)
):
    """Get available doctors for a specific date and (optionally) time slot"""
    doctors = UserController.get_doctors_by_availability(db, date, time_slot)
    response = {
        "available_doctors": [UserResponse.from_orm(doctor) for doctor in doctors],
        "date": date
    }
    if time_slot is not None:
        response["time_slot"] = time_slot
    return response