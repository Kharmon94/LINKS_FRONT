const PROMPT_KEY_PREFIX = 'pwa_install_prompt_dismissed:';

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
}

export function isIosBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports as Mac; touch points distinguish from MacBooks.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

export function isAndroidBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

/** Mobile / tablet browsers where Add to Home Screen applies. */
export function shouldOfferPwaInstall(): boolean {
  if (typeof window === 'undefined') return false;
  if (isStandalonePwa()) return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  return window.matchMedia('(max-width: 1024px)').matches;
}

export function hasSeenPwaInstallPrompt(userId: string): boolean {
  try {
    return localStorage.getItem(`${PROMPT_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return true;
  }
}

export function markPwaInstallPromptSeen(userId: string): void {
  try {
    localStorage.setItem(`${PROMPT_KEY_PREFIX}${userId}`, '1');
  } catch {
    // ignore storage failures
  }
}

export type PwaInstallPlatform = 'ios' | 'android' | 'other';

export function detectPwaInstallPlatform(): PwaInstallPlatform {
  if (isIosBrowser()) return 'ios';
  if (isAndroidBrowser()) return 'android';
  return 'other';
}

/** Show install prompt only inside the signed-in app, not on marketing/auth flows. */
export function isAuthenticatedAppRoute(pathname: string): boolean {
  if (pathname === '/') return false;
  if (pathname.startsWith('/auth')) return false;
  if (pathname === '/pricing' || pathname === '/use-cases' || pathname === '/book-a-call') {
    return false;
  }
  return true;
}
