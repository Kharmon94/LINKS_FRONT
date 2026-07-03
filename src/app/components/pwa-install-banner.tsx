import { ChevronRight, Smartphone, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/app/contexts/auth-context';
import { usePwaInstall } from '@/app/contexts/pwa-install-context';
import { isAuthenticatedAppRoute } from '@/lib/pwa-install';

export function PwaInstallBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  const { bannerVisible, isStandalone, dismissInstallBanner } = usePwaInstall();

  if (
    loading ||
    !isAuthenticated ||
    !user ||
    isStandalone ||
    !bannerVisible ||
    !isAuthenticatedAppRoute(location.pathname)
  ) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex w-full items-center gap-3 border-b border-primary/20 bg-primary px-4 py-2.5 text-primary-foreground shadow-md">
      <button
        type="button"
        onClick={() => navigate('/settings?tab=help')}
        className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-90"
        aria-label="Install Links for the best experience"
      >
        <Smartphone className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-sm font-medium">Install Links for the best experience</span>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          dismissInstallBanner();
        }}
        className="shrink-0 rounded-full p-1 opacity-80 transition-opacity hover:opacity-100"
        aria-label="Dismiss install banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
