import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  CheckCircle2,
  Loader2,
  MoreVertical,
  Plus,
  Share,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import { usePwaInstall } from '@/app/contexts/pwa-install-context';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  detectPwaInstallPlatform,
  hasPwaInstallConfirmed,
  isAuthenticatedAppRoute,
  isPwaInstallDetectedOnServer,
  markPwaInstallConfirmed,
  setInstallBannerActive,
  shouldOfferPwaInstall,
  shouldShowInstallBanner,
  type PwaInstallPlatform,
} from '@/lib/pwa-install';
import { resetPwaInstall } from '@/services/pwa-api';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type ModalPhase = 'waiting' | 'success';

const POLL_INTERVAL_MS = 2000;

function InstallSteps({ platform }: { platform: PwaInstallPlatform }) {
  if (platform === 'ios') {
    return (
      <ol className="space-y-4 text-sm text-muted-foreground">
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            1
          </span>
          <span className="pt-0.5">
            Tap the <Share className="inline h-4 w-4 align-text-bottom" /> Share button in Safari
            (bottom bar on iPhone, top bar on iPad).
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            2
          </span>
          <span className="pt-0.5">
            Scroll the menu and tap <strong className="text-foreground">Add to Home Screen</strong>.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            3
          </span>
          <span className="pt-0.5">
            Tap <strong className="text-foreground">Add</strong> — Links will open full-screen from
            your home screen.
          </span>
        </li>
      </ol>
    );
  }

  if (platform === 'android') {
    return (
      <ol className="space-y-4 text-sm text-muted-foreground">
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            1
          </span>
          <span className="pt-0.5">
            Tap the <MoreVertical className="inline h-4 w-4 align-text-bottom" /> menu in Chrome
            (top right).
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            2
          </span>
          <span className="pt-0.5">
            Tap <strong className="text-foreground">Install app</strong> or{' '}
            <strong className="text-foreground">Add to Home screen</strong>.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            3
          </span>
          <span className="pt-0.5">Confirm — Links will open from your home screen like a native app.</span>
        </li>
      </ol>
    );
  }

  return (
    <ol className="space-y-4 text-sm text-muted-foreground">
      <li className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          1
        </span>
        <span className="pt-0.5">Open this site in your phone&apos;s browser (Safari or Chrome).</span>
      </li>
      <li className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          2
        </span>
        <span className="pt-0.5">
          Use your browser&apos;s <strong className="text-foreground">Add to Home Screen</strong> or{' '}
          <strong className="text-foreground">Install</strong> option.
        </span>
      </li>
      <li className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          3
        </span>
        <span className="pt-0.5">Launch Links from your home screen for the best experience.</span>
      </li>
    </ol>
  );
}

export function PwaInstallPrompt() {
  const location = useLocation();
  const { isAuthenticated, loading, user, refreshUser } = useAuth();
  const {
    isStandalone,
    justInstalled,
    modalOpen,
    manualOpen,
    dismissToBanner,
    closeInstallModal,
    setModalOpen,
    refreshBannerState,
  } = usePwaInstall();
  const [phase, setPhase] = useState<ModalPhase>('waiting');
  const [platform, setPlatform] = useState<PwaInstallPlatform>('other');
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const resetDoneRef = useRef(false);

  const installDetected =
    phase === 'success' || isPwaInstallDetectedOnServer(user) || justInstalled;

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if ((justInstalled || isPwaInstallDetectedOnServer(user)) && modalOpen) {
      setPhase('success');
    }
  }, [justInstalled, user?.pwaInstalledAt, modalOpen, user]);

  useEffect(() => {
    if (!modalOpen) {
      resetDoneRef.current = false;
      return;
    }
    if (phase !== 'waiting' || resetDoneRef.current) {
      return;
    }

    resetDoneRef.current = true;
    void (async () => {
      try {
        await resetPwaInstall();
        await refreshUser();
      } catch {
        // polling still works if reset fails; user may see stale success
      }
    })();
  }, [modalOpen, phase, refreshUser]);

  useEffect(() => {
    if (!modalOpen || phase !== 'waiting' || installDetected) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshUser();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [modalOpen, phase, installDetected, refreshUser]);

  useEffect(() => {
    if (manualOpen) {
      setPhase('waiting');
      setPlatform(detectPwaInstallPlatform());
      return;
    }

    if (loading || !isAuthenticated || !user || isStandalone) {
      setModalOpen(false);
      return;
    }

    const freshInstallWhileOpen =
      modalOpen && (justInstalled || isPwaInstallDetectedOnServer(user) || phase === 'success');

    if (freshInstallWhileOpen) {
      setPhase('success');
      return;
    }

    if (
      !shouldOfferPwaInstall() ||
      !isAuthenticatedAppRoute(location.pathname) ||
      hasPwaInstallConfirmed(user.id) ||
      shouldShowInstallBanner()
    ) {
      setModalOpen(false);
      return;
    }

    setPlatform(detectPwaInstallPlatform());
    setPhase('waiting');
    setModalOpen(true);
  }, [
    isAuthenticated,
    loading,
    user,
    location.pathname,
    isStandalone,
    manualOpen,
    setModalOpen,
    modalOpen,
    justInstalled,
    phase,
  ]);

  const handleDismiss = () => {
    dismissToBanner();
    setPhase('waiting');
  };

  const handleDone = () => {
    if (user) markPwaInstallConfirmed(user.id);
    setInstallBannerActive(false);
    refreshBannerState();
    closeInstallModal();
    setPhase('waiting');
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === 'accepted') {
      setPhase('success');
    }
  };

  if (isStandalone) return null;

  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(next) => {
        if (!next) {
          if (phase === 'success') {
            handleDone();
          } else {
            handleDismiss();
          }
        } else {
          setModalOpen(next);
        }
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        {phase === 'success' ? (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <DialogTitle>Added to Home Screen</DialogTitle>
              <DialogDescription>
                Open Links from your home screen to get started.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button type="button" onClick={handleDone} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Add Links to your home screen</DialogTitle>
              <DialogDescription>
                Install the app for faster access, full-screen view, and staying signed in when you
                reopen it.
              </DialogDescription>
            </DialogHeader>

            <InstallSteps platform={platform} />

            <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              <span>Follow the steps above to add Links to your home screen</span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 sm:flex-col sm:items-stretch">
              {installEvent && (
                <Button type="button" onClick={() => void handleInstall()} className="w-full">
                  <Plus className="h-4 w-4" />
                  Install app
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleDismiss}
                className="w-full"
              >
                Not now
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
