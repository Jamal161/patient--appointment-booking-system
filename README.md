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


   4. Create Admin using API and postman or swagger ui 

