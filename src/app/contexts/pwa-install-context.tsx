import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { usePwaStandalone } from '@/hooks/use-pwa-standalone';
import { usePwaStandaloneConfirm } from '@/hooks/use-pwa-standalone-confirm';
import {
  clearPwaInstallConfirmed,
  dismissInstallBannerForSession,
  isInstallBannerDismissedForSession,
  isReturningPwaUser,
  setInstallBannerActive,
  shouldOfferPwaInstall,
  shouldShowInstallBanner,
} from '@/lib/pwa-install';
import { resetPwaInstall } from '@/services/pwa-api';

interface PwaInstallContextValue {
  isStandalone: boolean;
  justInstalled: boolean;
  isReinstallSession: boolean;
  bannerVisible: boolean;
  modalOpen: boolean;
  manualOpen: boolean;
  openInstallModal: () => void;
  dismissToBanner: () => void;
  dismissInstallBanner: () => void;
  startPwaInstallFlow: () => Promise<void>;
  closeInstallModal: () => void;
  setModalOpen: (open: boolean) => void;
  refreshBannerState: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined);

function PwaInstallConfirmEffect() {
  usePwaStandaloneConfirm();
  return null;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const { isStandalone, justInstalled } = usePwaStandalone();
  const [bannerActive, setBannerActive] = useState(() => shouldShowInstallBanner());
  const [sessionBannerDismissed, setSessionBannerDismissed] = useState(() =>
    isInstallBannerDismissedForSession()
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [reinstallSessionLatch, setReinstallSessionLatch] = useState(false);
  const proactiveResetDoneRef = useRef(false);

  useEffect(() => {
    if (!user || reinstallSessionLatch) return;
    if (isReturningPwaUser(user.id) || Boolean(user.pwaInstalledAt)) {
      setReinstallSessionLatch(true);
    }
  }, [user, reinstallSessionLatch]);

  const isReinstallSession = reinstallSessionLatch;

  useEffect(() => {
    if (!user || isStandalone || !isReinstallSession || proactiveResetDoneRef.current) {
      return;
    }
    proactiveResetDoneRef.current = true;
    void (async () => {
      try {
        await resetPwaInstall();
        await refreshUser();
      } catch {
        // banner still guides user to Settings Help
      }
    })();
  }, [user, isStandalone, isReinstallSession, refreshUser]);

  const refreshBannerState = useCallback(() => {
    setBannerActive(shouldShowInstallBanner());
    setSessionBannerDismissed(isInstallBannerDismissedForSession());
  }, []);

  useEffect(() => {
    if (isStandalone && bannerActive) {
      setInstallBannerActive(false);
      setBannerActive(false);
    }
  }, [isStandalone, bannerActive]);

  const openInstallModal = useCallback(() => {
    setManualOpen(true);
    setModalOpen(true);
  }, []);

  const dismissToBanner = useCallback(() => {
    setInstallBannerActive(true);
    setBannerActive(true);
    setSessionBannerDismissed(false);
    setManualOpen(false);
    setModalOpen(false);
  }, []);

  const dismissInstallBanner = useCallback(() => {
    dismissInstallBannerForSession();
    setSessionBannerDismissed(true);
    setBannerActive(false);
  }, []);

  const startPwaInstallFlow = useCallback(async () => {
    if (!user) return;
    clearPwaInstallConfirmed(user.id);
    try {
      await resetPwaInstall();
      await refreshUser();
    } catch {
      // still open modal so user can retry install steps
    }
    openInstallModal();
  }, [user, refreshUser, openInstallModal]);

  const closeInstallModal = useCallback(() => {
    setManualOpen(false);
    setModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isStandalone,
      justInstalled,
      isReinstallSession,
      bannerVisible:
        (bannerActive || isReinstallSession) &&
        !sessionBannerDismissed &&
        !isStandalone &&
        shouldOfferPwaInstall(),
      modalOpen,
      manualOpen,
      openInstallModal,
      dismissToBanner,
      dismissInstallBanner,
      startPwaInstallFlow,
      closeInstallModal,
      setModalOpen,
      refreshBannerState,
    }),
    [
      isStandalone,
      justInstalled,
      isReinstallSession,
      bannerActive,
      sessionBannerDismissed,
      modalOpen,
      manualOpen,
      openInstallModal,
      dismissToBanner,
      dismissInstallBanner,
      startPwaInstallFlow,
      closeInstallModal,
      refreshBannerState,
    ]
  );

  return (
    <PwaInstallContext.Provider value={value}>
      <PwaInstallConfirmEffect />
      {children}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (context === undefined) {
    throw new Error('usePwaInstall must be used within a PwaInstallProvider');
  }
  return context;
}
