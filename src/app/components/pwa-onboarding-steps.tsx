import { Bell, Link2, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export type OnboardingStep = 'welcome' | 'push';

interface PwaOnboardingStepsProps {
  step: OnboardingStep;
  onEnablePush: () => void;
  onSkipPush: () => void;
  pushBusy: boolean;
}

function WelcomeIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      <div className="rounded-[2rem] border-4 border-foreground/10 bg-gradient-to-b from-muted to-background p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-center gap-1">
          <div className="h-1 w-8 rounded-full bg-foreground/20" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
            <Link2 className="h-4 w-4 text-primary" />
            <div className="h-2 flex-1 rounded bg-primary/30" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <div className="h-4 w-4 rounded bg-foreground/10" />
            <div className="h-2 flex-1 rounded bg-foreground/10" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <div className="h-4 w-4 rounded bg-foreground/10" />
            <div className="h-2 w-2/3 rounded bg-foreground/10" />
          </div>
        </div>
      </div>
      <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
        <Smartphone className="h-5 w-5" />
      </div>
    </div>
  );
}

function LockScreenMock() {
  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      <div className="rounded-[2rem] border-4 border-foreground/10 bg-gradient-to-b from-slate-900 to-slate-800 p-4 text-white shadow-xl">
        <p className="mb-1 text-center text-2xl font-light">9:41</p>
        <p className="mb-4 text-center text-xs text-white/60">Thursday, July 2</p>
        <div className="rounded-2xl bg-white/95 p-3 text-left text-slate-900 shadow-md">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Link2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold">Links</span>
            <span className="ml-auto text-[10px] text-slate-500">now</span>
          </div>
          <p className="text-sm font-medium">Your link got 100 clicks!</p>
          <p className="text-xs text-slate-500">mybrand.link/summer — trending today</p>
        </div>
      </div>
    </div>
  );
}

export function PwaOnboardingSteps({
  step,
  onEnablePush,
  onSkipPush,
  pushBusy,
}: PwaOnboardingStepsProps) {
  if (step === 'welcome') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <WelcomeIllustration />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Welcome to Links</h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          Your links, full-screen — faster access from your home screen and alerts when they perform.
        </p>
        <ul className="mt-8 space-y-4 text-left text-sm">
          <li className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Full-screen app experience</p>
              <p className="text-muted-foreground">No browser chrome — just your links.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Faster access</p>
              <p className="text-muted-foreground">Launch from your home screen in one tap.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Link alerts</p>
              <p className="text-muted-foreground">Know when your links hit milestones.</p>
            </div>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <LockScreenMock />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight">Stay in the loop</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Get notified when your links get clicks, hit milestones, or need attention.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <Button
          type="button"
          className="w-full rounded-full"
          disabled={pushBusy}
          onClick={onEnablePush}
        >
          {pushBusy ? 'Enabling…' : 'Enable Notifications'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full rounded-full"
          disabled={pushBusy}
          onClick={onSkipPush}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
