import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { isPwaOnboardingComplete } from '@/lib/pwa-install';
import { usePwaInstall } from '@/app/contexts/pwa-install-context';

export function PwaOnboardingGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isStandalone } = usePwaInstall();

  if (
    isStandalone &&
    !isPwaOnboardingComplete() &&
    location.pathname !== '/pwa/onboarding'
  ) {
    return <Navigate to="/pwa/onboarding" replace />;
  }

  return children;
}
