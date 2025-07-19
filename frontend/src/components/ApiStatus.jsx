import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ApiStatus({ status, className }) {
  const statusConfig = {
    loading: {
      icon: Loader2,
      label: 'Loading',
      variant: 'secondary',
      className: 'animate-spin'
    },
    success: {
      icon: CheckCircle,
      label: 'Connected',
      variant: 'default',
      className: 'text-green-600'
    },
    error: {
      icon: XCircle,
      label: 'Error',
      variant: 'destructive',
      className: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      label: 'Warning',
      variant: 'secondary',
      className: 'text-yellow-600'
    }
  };

  const config = statusConfig[status] || statusConfig.error;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('flex items-center gap-1', className)}>
      <Icon className={cn('h-3 w-3', config.className)} />
      {config.label}
    </Badge>
  );
}

export function ApiStatusIndicator({ isLoading, isError, error }) {
  if (isLoading) return <ApiStatus status="loading" />;
  if (isError) return <ApiStatus status="error" />;
  return <ApiStatus status="success" />;
}