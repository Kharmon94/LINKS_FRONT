import { ChevronRight, Smartphone } from 'lucide-react';
import { useLocation } from 'react-router';
import { useAuth } from '@/app/contexts/auth-context';
import { usePwaInstall } from '@/app/contexts/pwa-install-context';
import {
  hasPwaInstallConfirmed,
  isAuthenticatedAppRoute,
  shouldOfferPwaInstall,
} from '@/lib/pwa-install';

export function PwaInstallBanner() {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuth();
  const { bannerVisible, isStandalone, openInstallModal } = usePwaInstall();

  if (
    loading ||
    !isAuthenticated ||
    !user ||
    isStandalone ||
    !bannerVisible ||
    !shouldOfferPwaInstall() ||
    !isAuthenticatedAppRoute(location.pathname) ||
    hasPwaInstallConfirmed(user.id)
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={openInstallModal}
      className="fixed left-0 right-0 top-0 z-50 flex w-full items-center gap-3 border-b border-primary/20 bg-primary px-4 py-2.5 text-left text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
      aria-label="Install Links for the best experience"
    >
      <Smartphone className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-sm font-medium">Install Links for the best experience</span>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
    </button>
  );
}
