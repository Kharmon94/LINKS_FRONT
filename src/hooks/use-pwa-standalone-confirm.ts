import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { usePwaInstall } from '@/app/contexts/pwa-install-context';
import { isStandalonePwa } from '@/lib/pwa-install';
import { confirmPwaInstall } from '@/services/pwa-api';

/**
 * On first standalone launch (or Android appinstalled), confirm PWA install on the server
 * so the Safari install modal can detect success via polling.
 */
export function usePwaStandaloneConfirm() {
  const { isAuthenticated, user, setUser } = useAuth();
  const { justInstalled } = usePwaInstall();
  const confirmingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || user.pwaInstalledAt) return;

    const shouldConfirm = isStandalonePwa() || justInstalled;
    if (!shouldConfirm || confirmingRef.current) return;

    confirmingRef.current = true;
    void confirmPwaInstall()
      .then(({ user: updatedUser }) => {
        setUser(updatedUser);
      })
      .catch(() => {
        confirmingRef.current = false;
      });
  }, [isAuthenticated, user, justInstalled, setUser]);
}
