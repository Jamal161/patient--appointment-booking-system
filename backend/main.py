import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError

from views import user_view, appointment_view, report_view
from utils.database import Base, engine, create_tables, test_connection
from models import User, Appointment, Report
from utils.tasks import setup_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting up Healthcare Appointment System...")
    
    try:
        # Test database connection first
        if not test_connection():
            raise Exception("Database connection failed")
        
        # Create database tables
        create_tables()
        logger.info("Database tables created successfully!")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        # Don't raise here to allow the app to start even if DB is not ready
        logger.warning("App starting without database connection")
    
    try:
        # Start background scheduler
        scheduler = setup_scheduler()
        logger.info("Background scheduler started successfully!")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")
        # Don't raise here as the app can still function without scheduler
    
    yield
    
    # Shutdown
    logger.info("Shutting down Healthcare Appointment System...")

# Create FastAPI app
app = FastAPI(
    title="Healthcare Appointment System",
    description="A comprehensive appointment booking system for healthcare providers",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    logger.error(f"Database error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error occurred. Please try again later."}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )

# Health check endpoint
@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "message": "Healthcare Appointment System API is running",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health", tags=["Health"])
def detailed_health_check():
    """Detailed health check with system information"""
    try:
        # Test database connection
        db_status = "healthy" if test_connection() else "unhealthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "unhealthy"
    
    return {
        "api_status": "healthy",
        "database_status": db_status,
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

# Register API routers
app.include_router(user_view.router, prefix="/api/v1")
app.include_router(appointment_view.router, prefix="/api/v1")
app.include_router(report_view.router, prefix="/api/v1")

# API documentation
@app.get("/api/info", tags=["API Info"])
def api_info():
    """Get API information and available endpoints"""
    return {
        "title": "Healthcare Appointment System API",
        "version": "1.0.0",
        "description": "A comprehensive appointment booking system",
        "endpoints": {
            "authentication": "/api/v1/users/login",
            "registration": "/api/v1/users/register",
            "appointments": "/api/v1/appointments/",
            "users": "/api/v1/users/",
            "reports": "/api/v1/reports/",
            "documentation": "/docs",
            "health": "/health"
        },
        "features": [
            "JWT Authentication",
            "Role-based Access Control",
            "Appointment Management",
            "User Profile Management",
            "Background Task Scheduling",
            "Email/SMS Reminders",
            "Monthly Reports",
            "File Upload Support"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )