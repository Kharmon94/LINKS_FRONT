import { type ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface GuestRouteProps {
  children: ReactNode;
  /** Honor `?returnTo=` and `post_auth_redirect` when sending signed-in users away from auth. */
  respectReturnTo?: boolean;
}

function resolveAuthenticatedDestination(respectReturnTo: boolean, returnTo: string | null): string {
  if (respectReturnTo) {
    if (returnTo) {
      try {
        return decodeURIComponent(returnTo);
      } catch {
        return returnTo;
      }
    }
    const stored = sessionStorage.getItem('post_auth_redirect');
    if (stored) {
      sessionStorage.removeItem('post_auth_redirect');
      return stored;
    }
  }
  return '/dashboard';
}

export function GuestRoute({ children, respectReturnTo = false }: GuestRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    const dest = resolveAuthenticatedDestination(respectReturnTo, searchParams.get('returnTo'));
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}
