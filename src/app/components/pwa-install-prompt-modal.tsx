import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { MoreVertical, Plus, Share, Smartphone } from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
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
  hasSeenPwaInstallPrompt,
  isAuthenticatedAppRoute,
  isStandalonePwa,
  markPwaInstallPromptSeen,
  shouldOfferPwaInstall,
  type PwaInstallPlatform,
} from '@/lib/pwa-install';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

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
  const { isAuthenticated, loading, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<PwaInstallPlatform>('other');
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (loading || !isAuthenticated || !user) {
      setOpen(false);
      return;
    }
    if (
      isStandalonePwa() ||
      !shouldOfferPwaInstall() ||
      !isAuthenticatedAppRoute(location.pathname) ||
      hasSeenPwaInstallPrompt(user.id)
    ) {
      setOpen(false);
      return;
    }
    setPlatform(detectPwaInstallPlatform());
    setOpen(true);
  }, [isAuthenticated, loading, user, location.pathname]);

  const dismiss = () => {
    if (user) markPwaInstallPromptSeen(user.id);
    setOpen(false);
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    dismiss();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
        else setOpen(next);
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
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

        <DialogFooter className="gap-2 sm:gap-0 sm:flex-col sm:items-stretch">
          {installEvent && (
            <Button type="button" onClick={() => void handleInstall()} className="w-full">
              <Plus className="h-4 w-4" />
              Install app
            </Button>
          )}
          <Button type="button" variant={installEvent ? 'outline' : 'default'} onClick={dismiss} className="w-full">
            {installEvent ? 'Maybe later' : 'Got it'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
