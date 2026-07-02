const PROMPT_KEY_PREFIX = 'pwa_install_prompt_dismissed:';
const ONBOARDING_KEY = 'pwa_onboarding_completed';
const BANNER_KEY = 'pwa_install_banner_active';
const PENDING_PUSH_KEY = 'pwa_pending_push_subscribe';

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

export function hasPwaInstallConfirmed(
  userId: string,
  user?: { pwaInstalledAt?: string | null } | null
): boolean {
  if (user?.pwaInstalledAt) return true;
  try {
    return localStorage.getItem(`${PROMPT_KEY_PREFIX}${userId}`) === '1';
  } catch {
    return true;
  }
}

export function markPwaInstallConfirmed(userId: string): void {
  try {
    localStorage.setItem(`${PROMPT_KEY_PREFIX}${userId}`, '1');
    setInstallBannerActive(false);
  } catch {
    // ignore storage failures
  }
}

/** @deprecated Use hasPwaInstallConfirmed */
export function hasSeenPwaInstallPrompt(userId: string): boolean {
  return hasPwaInstallConfirmed(userId);
}

/** @deprecated Use markPwaInstallConfirmed */
export function markPwaInstallPromptSeen(userId: string): void {
  markPwaInstallConfirmed(userId);
}

export function isPwaOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return true;
  }
}

export function markPwaOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    // ignore storage failures
  }
}

export function shouldShowInstallBanner(): boolean {
  try {
    return localStorage.getItem(BANNER_KEY) === '1';
  } catch {
    return false;
  }
}

export function setInstallBannerActive(active: boolean): void {
  try {
    if (active) {
      localStorage.setItem(BANNER_KEY, '1');
    } else {
      localStorage.removeItem(BANNER_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

export function setPendingPushSubscribe(): void {
  try {
    localStorage.setItem(PENDING_PUSH_KEY, '1');
  } catch {
    // ignore storage failures
  }
}

export function consumePendingPushSubscribe(): boolean {
  try {
    if (localStorage.getItem(PENDING_PUSH_KEY) === '1') {
      localStorage.removeItem(PENDING_PUSH_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
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
  if (pathname.startsWith('/pwa/')) return false;
  return true;
}
