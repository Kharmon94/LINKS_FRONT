import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/contexts/auth-context';
import { PwaOnboardingSteps, type OnboardingStep } from '@/app/components/pwa-onboarding-steps';
import { Button } from '@/app/components/ui/button';
import {
  markPwaOnboardingComplete,
  setPendingPushSubscribe,
} from '@/lib/pwa-install';
import {
  consumeAndSubscribePush,
  isPushSupported,
  requestPushPermission,
} from '@/lib/push-notifications';

export function PwaOnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [pushBusy, setPushBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const finishOnboarding = async () => {
    if (finishing) return;
    setFinishing(true);
    markPwaOnboardingComplete();

    if (isAuthenticated) {
      await consumeAndSubscribePush();
    }

    if (loading) {
      setFinishing(false);
      return;
    }

    navigate(isAuthenticated ? '/links' : '/auth', { replace: true });
  };

  useEffect(() => {
    if (!finishing || loading) return;
    navigate(isAuthenticated ? '/links' : '/auth', { replace: true });
  }, [finishing, loading, isAuthenticated, navigate]);

  const handleEnablePush = async () => {
    if (!isPushSupported()) {
      void finishOnboarding();
      return;
    }
    setPushBusy(true);
    try {
      const perm = await requestPushPermission();
      if (perm === 'granted') {
        setPendingPushSubscribe();
      }
    } finally {
      setPushBusy(false);
      void finishOnboarding();
    }
  };

  const handleSkipPush = () => {
    void finishOnboarding();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col">
        <PwaOnboardingSteps
          step={step}
          onEnablePush={() => void handleEnablePush()}
          onSkipPush={handleSkipPush}
          pushBusy={pushBusy || finishing}
        />
      </div>
      {step === 'welcome' && (
        <div className="border-t border-border px-6 pb-8 pt-4">
          <Button
            type="button"
            className="w-full rounded-full"
            onClick={() => setStep('push')}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
