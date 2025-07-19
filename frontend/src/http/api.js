import axios from "axios";

const prefixUrl = "http://127.0.0.1:8000";

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: prefixUrl,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const parsedToken = JSON.parse(token);
      config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/Auth/Login';
    }
    return Promise.reject(error);
  }
);

// ========== AUTHENTICATION ==========

// Login user
export const loginUser = async (data) => {
  try {
    const response = await apiClient.post("/api/v1/users/login", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Register user
export const registerUser = async (data) => {
  try {
    const response = await apiClient.post("/api/v1/users/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get current logged-in user
export const fetchCurrentUser = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update current user profile
export const updateCurrentUser = async (data) => {
  try {
    const response = await apiClient.put("/api/v1/users/me", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Upload profile image
export const uploadProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post("/api/v1/users/upload-profile-image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== USERS ==========

// Create new user
export const createUser = async (data) => {
  try {
    const response = await apiClient.post("/api/v1/users/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all users with filters
export const fetchUsers = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/users/", { params });
    return response.data.users || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user by ID
export const fetchUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/api/v1/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get doctors only
export const fetchDoctors = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/users/doctors", { params });
    return response.data.doctors || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get patients only
export const fetchPatients = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/users/", { 
      params: { ...params, user_type: "patient" } 
    });
    return response.data.users || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get available doctors by date
export const fetchAvailableDoctors = async (date, timeSlot = null) => {
  try {
    const params = timeSlot ? { datetime: timeSlot } : {};
    const response = await apiClient.get(`/api/v1/users/doctors/available/${date}`, { params });
    return response.data.available_doctors || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== APPOINTMENTS ==========

// Create appointment
export const createAppointment = async (data) => {
  try {
    const response = await apiClient.post("/api/v1/appointments/", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments with filters
export const fetchAppointments = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/appointments/", { params });
    return response.data.appointments || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointment by ID
export const fetchAppointmentById = async (appointmentId) => {
  try {
    const response = await apiClient.get(`/api/v1/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, data) => {
  try {
    const response = await apiClient.put(`/api/v1/appointments/${appointmentId}/status`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get my upcoming appointments
export const fetchMyUpcomingAppointments = async () => {
  try {
    const response = await apiClient.get("/api/v1/appointments/my/upcoming");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get today's appointments
export const fetchTodaysAppointments = async () => {
  try {
    const response = await apiClient.get("/api/v1/appointments/today/all");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointment statistics
export const fetchAppointmentStats = async () => {
  try {
    const response = await apiClient.get("/api/v1/appointments/stats/summary");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments by date range
export const fetchAppointmentsByDateRange = async (dateFrom, dateTo) => {
  try {
    const response = await apiClient.get("/api/v1/appointments/", {
      params: { date_from: dateFrom, date_to: dateTo }
    });
    return response.data.appointments || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments by patient
export const fetchAppointmentsByPatient = async (patientId) => {
  try {
    const response = await apiClient.get("/api/v1/appointments/", {
      params: { patient_id: patientId }
    });
    return response.data.appointments || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments by doctor
export const fetchAppointmentsByDoctor = async (doctorId) => {
  try {
    const response = await apiClient.get("/api/v1/appointments/", {
      params: { doctor_id: doctorId }
    });
    return response.data.appointments || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== REPORTS ==========

// Generate monthly report
export const generateMonthlyReport = async (year, month) => {
  try {
    const response = await apiClient.post(`/api/v1/reports/generate/${year}/${month}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== DASHBOARD STATS ==========

// Get total patients count
export const fetchTotalPatients = async () => {
  try {
    const patients = await fetchPatients();
    return Array.isArray(patients) ? patients.length : 0;
  } catch (error) {
    return 0;
  }
};

// Get total doctors count
export const fetchTotalDoctors = async () => {
  try {
    const doctors = await fetchDoctors();
    return Array.isArray(doctors) ? doctors.length : 0;
  } catch (error) {
    return 0;
  }
};

// Get pending appointments count
export const fetchTotalPendingAppointmentCount = async () => {
  try {
    const appointments = await fetchAppointments({ status: "pending" });
    return Array.isArray(appointments) ? appointments.length : 0;
  } catch (error) {
    return 0;
  }
};

// Get completed appointments count
export const fetchTotalCompletedAppointmentCount = async () => {
  try {
    const appointments = await fetchAppointments({ status: "completed" });
    return Array.isArray(appointments) ? appointments.length : 0;
  } catch (error) {
    return 0;
  }
};

// ========== HEALTH CHECK ==========

// Check API health
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get("/health");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get API info
export const fetchApiInfo = async () => {
  try {
    const response = await apiClient.get("/api/info");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};