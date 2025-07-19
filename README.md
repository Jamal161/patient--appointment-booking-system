# Setup Instructions
1. **Backend Setup**:
   - Install dependencies: `pip install -r requirements.txt`
   - Update `SQLALCHEMY_DATABASE_URL` in `utils/database.py` with your PostgreSQL credentials
   - Run the FastAPI server: `python -m uvicorn main:app --reload --port 8000`

2. **Frontend Setup**:
   - Install dependencies: `npm install`
   - Initialize Tailwind CSS: `npx tailwindcss init`
   - Run the development server: `npm start`

3. **Database**:
   - Ensure PostgreSQL is running
   - Create a database named `appointment_db`
   - The tables will be created automatically when the FastAPI server starts


   4. **Create Admin using API and postman or swagger ui**

📂 **API Documentation**
- Full interactive documentation is available via Swagger UI.

- Base URL: http://localhost:8000

- Swagger UI: /docs

- ReDoc: /redoc



🔐 **Authentication**
- Method	Endpoint	Description
- POST	/api/v1/users/register	User Registration
- POST	/api/v1/users/login	User Login
- GET	/api/v1/users/me	Get Current User
- PUT	/api/v1/users/me	Update Profile

🧑‍⚕️ **User & Doctor Endpoints**
- Method	Endpoint	Description
- GET	/api/v1/users/	Get All Users
- GET	/api/v1/users/{user_id}	Get User by ID
- GET	/api/v1/users/doctors	Get All Doctors
- GET	/api/v1/users/doctors/available/{date}	Get Doctor Availability by Date
- POST	/api/v1/users/upload-profile-image	Upload Profile Image

📅 **Appointment Endpoints**
- Method	Endpoint	Description
- POST	/api/v1/appointments/	Create Appointment
- GET	/api/v1/appointments/	List All Appointments
- GET	/api/v1/appointments/{appointment_id}	Get Appointment by ID
- PUT	/api/v1/appointments/{appointment_id}/status	Update Status
- GET	/api/v1/appointments/my/upcoming	My Upcoming Appointments
- GET	/api/v1/appointments/today/all	Today’s Appointments
- GET	/api/v1/appointments/stats/summary	Appointment Stats Summary

📊 **Reports**
- Method	Endpoint	Description
- POST	/api/v1/reports/generate/{year}/{month}	Generate Monthly Report

📦 **API Response Schemas**
- Includes standardized models like:

- UserCreate, UserResponse, UserUpdateRequest

- AppointmentCreate, AppointmentResponse, AppointmentStatusUpdate

- LoginRequest, TokenResponse

- ReportResponse, ValidationError, etc.
