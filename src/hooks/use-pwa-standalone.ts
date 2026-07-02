import { useEffect, useState } from 'react';
import { isStandalonePwa } from '@/lib/pwa-install';

export function usePwaStandalone() {
  const [isStandalone, setIsStandalone] = useState(() => isStandalonePwa());
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandalonePwa());

    const onAppInstalled = () => {
      setJustInstalled(true);
      // Do not set isStandalone here — the browser tab stays in-browser until launch from icon.
    };
    window.addEventListener('appinstalled', onAppInstalled);

    const mq = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = () => {
      setIsStandalone(isStandalonePwa());
    };
    mq.addEventListener('change', onDisplayModeChange);

    return () => {
      window.removeEventListener('appinstalled', onAppInstalled);
      mq.removeEventListener('change', onDisplayModeChange);
    };
  }, []);

  return { isStandalone, justInstalled, resetJustInstalled: () => setJustInstalled(false) };
}
