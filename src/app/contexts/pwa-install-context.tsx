import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePwaStandalone } from '@/hooks/use-pwa-standalone';
import { usePwaStandaloneConfirm } from '@/hooks/use-pwa-standalone-confirm';
import {
  setInstallBannerActive,
  shouldShowInstallBanner,
} from '@/lib/pwa-install';

interface PwaInstallContextValue {
  isStandalone: boolean;
  justInstalled: boolean;
  bannerVisible: boolean;
  modalOpen: boolean;
  manualOpen: boolean;
  openInstallModal: () => void;
  dismissToBanner: () => void;
  closeInstallModal: () => void;
  setModalOpen: (open: boolean) => void;
  refreshBannerState: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  usePwaStandaloneConfirm();
  const { isStandalone, justInstalled } = usePwaStandalone();
  const [bannerActive, setBannerActive] = useState(() => shouldShowInstallBanner());
  const [modalOpen, setModalOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const refreshBannerState = useCallback(() => {
    setBannerActive(shouldShowInstallBanner());
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
    setManualOpen(false);
    setModalOpen(false);
  }, []);

  const closeInstallModal = useCallback(() => {
    setManualOpen(false);
    setModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isStandalone,
      justInstalled,
      bannerVisible: bannerActive && !isStandalone,
      modalOpen,
      manualOpen,
      openInstallModal,
      dismissToBanner,
      closeInstallModal,
      setModalOpen,
      refreshBannerState,
    }),
    [
      isStandalone,
      justInstalled,
      bannerActive,
      modalOpen,
      manualOpen,
      openInstallModal,
      dismissToBanner,
      closeInstallModal,
      refreshBannerState,
    ]
  );

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (context === undefined) {
    throw new Error('usePwaInstall must be used within a PwaInstallProvider');
  }
  return context;
}
