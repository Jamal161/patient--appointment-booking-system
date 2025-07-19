import { useApiQuery } from './useApi';
import { fetchCurrentUser } from '@/http/api';
import useStoreToken from '@/http/store';

export function useAuth() {
  const token = useStoreToken((state) => state.token);
  const { data: user, isLoading, error } = useApiQuery(
    ['currentUser'],
    fetchCurrentUser,
    {
      enabled: !!token,
      retry: false,
    }
  );

  const isAuthenticated = !!token && !!user;
  const userRole = user?.user_type;

  const hasRole = (role) => {
    return userRole === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(userRole);
  };

  const canAccessRoute = (route) => {
    const routePermissions = {
      '/Dashboard': ['admin', 'doctor', 'patient'],
      '/Users': ['admin'],
      '/Appointments': ['admin', 'doctor'],
      '/Patients': ['admin', 'doctor'],
      '/Reports': ['admin'],
      '/Profile': ['admin', 'doctor', 'patient'],
    };

    const allowedRoles = routePermissions[route];
    return allowedRoles ? allowedRoles.includes(userRole) : false;
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    isAdmin: hasRole('admin'),
    isDoctor: hasRole('doctor'),
    isPatient: hasRole('patient'),
  };
}