import { detectPwaInstallPlatform, type PwaInstallPlatform } from './pwa-install';

export const NFC_TOOLS_IOS_APP_STORE_URL =
  'https://apps.apple.com/app/nfc-tools/id1252962749';
export const NFC_TOOLS_ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.wakdev.wdnfc';
/** Wakdev NFC Tools iOS custom URL scheme (undocumented but widely used). */
export const NFC_TOOLS_IOS_SCHEME = 'nfctools://';
export const NFC_TOOLS_ANDROID_PACKAGE = 'com.wakdev.wdnfc';

export const NFC_TOOLS_FALLBACK_DELAY_MS = 1500;

export function getNfcToolsStoreUrl(platform: PwaInstallPlatform): string {
  if (platform === 'android') return NFC_TOOLS_ANDROID_PLAY_STORE_URL;
  return NFC_TOOLS_IOS_APP_STORE_URL;
}

export function buildAndroidIntentUrl(
  fallbackUrl: string = NFC_TOOLS_ANDROID_PLAY_STORE_URL,
): string {
  const encodedFallback = encodeURIComponent(fallbackUrl);
  return `intent://#Intent;scheme=nfctools;package=${NFC_TOOLS_ANDROID_PACKAGE};S.browser_fallback_url=${encodedFallback};end`;
}

type DeepLinkFallbackDeps = {
  /** Launch the app URL; return cleanup (e.g. remove probe iframe). */
  launchAppUrl: (url: string) => () => void;
  openWindow: (url: string) => void;
  addVisibilityListener: (handler: () => void) => () => void;
  isDocumentHidden: () => boolean;
  scheduleFallback: (callback: () => void, delayMs: number) => () => void;
};

/**
 * Probe a custom URL scheme via a hidden iframe so iOS Safari / standalone PWA
 * does not navigate the main window (which triggers "address is invalid" alerts).
 */
export function launchAppUrlViaHiddenIframe(url: string): () => void {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);
  iframe.src = url;
  return () => iframe.remove();
}

function defaultDeepLinkDeps(): DeepLinkFallbackDeps {
  return {
    launchAppUrl: launchAppUrlViaHiddenIframe,
    openWindow: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    addVisibilityListener: (handler) => {
      document.addEventListener('visibilitychange', handler);
      return () => document.removeEventListener('visibilitychange', handler);
    },
    isDocumentHidden: () => document.hidden,
    scheduleFallback: (callback, delayMs) => {
      const id = window.setTimeout(callback, delayMs);
      return () => window.clearTimeout(id);
    },
  };
}

/** Try a deep link; open the store in a new tab if the page stays visible. */
export function tryOpenDeepLinkWithStoreFallback(
  appUrl: string,
  storeUrl: string,
  delayMs: number = NFC_TOOLS_FALLBACK_DELAY_MS,
  deps: DeepLinkFallbackDeps = defaultDeepLinkDeps(),
): void {
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
  };

  const removeVisibilityListener = deps.addVisibilityListener(() => {
    if (deps.isDocumentHidden()) {
      cancel();
      cleanup();
    }
  });

  const cancelTimeout = deps.scheduleFallback(() => {
    cleanup();
    if (!cancelled && !deps.isDocumentHidden()) {
      deps.openWindow(storeUrl);
    }
  }, delayMs);

  const removeAppLaunch = deps.launchAppUrl(appUrl);

  function cleanup() {
    removeVisibilityListener();
    cancelTimeout();
    removeAppLaunch();
  }
}

export function openNfcTools(): void {
  const platform = detectPwaInstallPlatform();
  const storeUrl = getNfcToolsStoreUrl(platform);

  if (platform === 'ios') {
    tryOpenDeepLinkWithStoreFallback(NFC_TOOLS_IOS_SCHEME, storeUrl);
    return;
  }

  if (platform === 'android') {
    window.location.assign(buildAndroidIntentUrl(storeUrl));
    return;
  }

  window.open(storeUrl, '_blank', 'noopener,noreferrer');
}
