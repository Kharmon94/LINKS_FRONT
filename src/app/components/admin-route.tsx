import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/auth-context';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?returnTo=${returnTo}`} replace />;
  }

  if (!user?.admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

