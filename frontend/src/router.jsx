import { createBrowserRouter } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Appointments from "@/pages/Appointments";
import PatientAppointments from "@/pages/PatientAppointments";
import Users from "@/pages/Users";
import MainLayout from "@/layouts/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Reports from "@/pages/Reports";
import PatientBooking from "@/pages/PatientBooking";

export var title = "Admin Panel";
export const router = new createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "/Dashboard",
        element: <Dashboard />,
      },
      {
        path: "/Profile",
        element: <Profile />,
      },
      
      {
        path: "/Patients",
        element: (
          <ProtectedRoute requiredRoles={['admin', 'doctor']}>
            <Patients />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Appointments",
        element: (
          <ProtectedRoute requiredRoles={['admin', 'doctor']}>
            <Appointments />
          </ProtectedRoute>
        ),
      },
      {
        path: "/PatientAppointments",
        element: (
          <ProtectedRoute requiredRoles={['admin', 'doctor']}>
            <PatientAppointments />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Users",
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Reports",
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "/BookAppointment",
        element: (
          <ProtectedRoute requiredRoles={['patient']}>
            <PatientBooking />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/Auth/Login",
    element: <Login />,
  },
  {
    path: "/Auth/Register",
    element: <Register />,
  },
]);
