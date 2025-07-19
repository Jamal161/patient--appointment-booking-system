from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from models.appointment import Appointment, AppointmentStatus
from models.user import User
from datetime import datetime, timedelta
from utils.database import SessionLocal
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_email_reminder(to_email: str, patient_name: str, doctor_name: str, appointment_time: datetime):
        """Send email reminder for appointment"""
        try:
            # Email configuration (you should use environment variables)
            smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            sender_email = os.getenv("SENDER_EMAIL", "your-email@gmail.com")
            sender_password = os.getenv("SENDER_PASSWORD", "your-password")
            
            # Create message
            message = MIMEMultipart()
            message["From"] = sender_email
            message["To"] = to_email
            message["Subject"] = "Appointment Reminder - Tomorrow"
            
            body = f"""
            Dear {patient_name},
            
            This is a reminder that you have an appointment scheduled for tomorrow:
            
            Doctor: Dr. {doctor_name}
            Date & Time: {appointment_time.strftime('%B %d, %Y at %I:%M %p')}
            
            Please make sure to arrive 15 minutes before your scheduled time.
            
            If you need to reschedule or cancel, please contact us as soon as possible.
            
            Best regards,
            Healthcare Appointment System
            """
            
            message.attach(MIMEText(body, "plain"))
            
            # Send email
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(message)
            
            logger.info(f"Reminder email sent to {to_email}")
            
        except Exception as e:
            logger.error(f"Failed to send email reminder: {str(e)}")

    @staticmethod
    def send_sms_reminder(phone_number: str, patient_name: str, doctor_name: str, appointment_time: datetime):
        """Send SMS reminder for appointment (placeholder implementation)"""
        try:
            # This is a placeholder - you would integrate with SMS service like Twilio
            message = f"Hi {patient_name}, reminder: You have an appointment with Dr. {doctor_name} tomorrow at {appointment_time.strftime('%I:%M %p')}. Healthcare System"
            
            logger.info(f"SMS reminder would be sent to {phone_number}: {message}")
            # Actual SMS implementation would go here
            
        except Exception as e:
            logger.error(f"Failed to send SMS reminder: {str(e)}")

def send_appointment_reminders():
    """Send reminders for appointments scheduled for tomorrow"""
    db = SessionLocal()
    try:
        # Get appointments for tomorrow
        tomorrow = datetime.utcnow() + timedelta(days=1)
        start_of_tomorrow = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_tomorrow = start_of_tomorrow + timedelta(days=1)
        
        appointments = db.query(Appointment).filter(
            Appointment.available_timeslots >= start_of_tomorrow,
            Appointment.available_timeslots < end_of_tomorrow,
            Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed])
        ).all()
        
        notification_service = NotificationService()
        
        for appointment in appointments:
            # Get patient and doctor details
            patient = db.query(User).filter(User.id == appointment.patient_id).first()
            doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
            
            if patient and doctor:
                # Send email reminder
                notification_service.send_email_reminder(
                    patient.email,
                    patient.full_name,
                    doctor.full_name,
                    appointment.available_timeslots
                )
                
                # Send SMS reminder
                notification_service.send_sms_reminder(
                    patient.mobile_number,
                    patient.full_name,
                    doctor.full_name,
                    appointment.available_timeslots
                )
        
        logger.info(f"Processed {len(appointments)} appointment reminders")
        
    except Exception as e:
        logger.error(f"Error in send_appointment_reminders: {str(e)}")
    finally:
        db.close()

def cleanup_old_appointments():
    """Clean up old cancelled appointments (optional maintenance task)"""
    db = SessionLocal()
    try:
        # Delete cancelled appointments older than 30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        deleted_count = db.query(Appointment).filter(
            Appointment.status == AppointmentStatus.cancelled,
            Appointment.created_at < cutoff_date
        ).delete()
        
        db.commit()
        logger.info(f"Cleaned up {deleted_count} old cancelled appointments")
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_appointments: {str(e)}")
    finally:
        db.close()

def setup_scheduler():
    """Setup background scheduler for tasks"""
    scheduler = BackgroundScheduler()
    
    try:
        # Schedule daily reminder task at 9 AM
        scheduler.add_job(
            send_appointment_reminders,
            'cron',
            hour=9,
            minute=0,
            id='daily_reminders'
        )
        
        # Schedule weekly cleanup task on Sundays at 2 AM
        scheduler.add_job(
            cleanup_old_appointments,
            'cron',
            day_of_week=6,  # Sunday
            hour=2,
            minute=0,
            id='weekly_cleanup'
        )
        
        scheduler.start()
        logger.info("Background scheduler started successfully")
        
        # For testing purposes, you can also run reminders every minute
        # scheduler.add_job(send_appointment_reminders, 'interval', minutes=1, id='test_reminders')
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")
        raise e
    
    return scheduler