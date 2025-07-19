import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Custom hook for API queries with error handling
export function useApiQuery(key, queryFn, options = {}) {
  return useQuery({
    queryKey: key,
    queryFn,
    onError: (error) => {
      const message = error?.detail || error?.message || 'An error occurred';
      toast.error('Error', {
        description: message,
      });
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 or 403 errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Custom hook for API mutations with success/error handling
export function useApiMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        toast.success('Success', {
          description: options.successMessage,
        });
      }
      
      // Invalidate related queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const message = error?.detail || error?.message || 'An error occurred';
      toast.error('Error', {
        description: message,
      });
      
      options.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Specific hooks for common operations
export function useUsers(filters = {}) {
  return useApiQuery(['users', filters], () => fetchUsers(filters));
}

export function useAppointments(filters = {}) {
  return useApiQuery(['appointments', filters], () => fetchAppointments(filters));
}

export function useCreateAppointment() {
  return useApiMutation(createAppointment, {
    successMessage: 'Appointment created successfully',
    invalidateQueries: [['appointments'], ['todaysAppointments']],
  });
}

export function useUpdateAppointmentStatus() {
  return useApiMutation(
    ({ appointmentId, status }) => updateAppointmentStatus(appointmentId, { status }),
    {
      successMessage: 'Appointment status updated successfully',
      invalidateQueries: [['appointments']],
    }
  );
}