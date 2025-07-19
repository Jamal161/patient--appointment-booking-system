import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function ProtectedRoute({ children, requiredRoles = [], fallbackPath = '/Dashboard' }) {
  const { isAuthenticated, isLoading, userRole, hasAnyRole } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Auth/Login" replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-destructive">
              <AlertCircle className="h-full w-full" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Required role: {requiredRoles.join(' or ')}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Your role: {userRole}
            </p>
            <Navigate to={fallbackPath} replace />
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}