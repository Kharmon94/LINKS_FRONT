import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NFC_TOOLS_ANDROID_PLAY_STORE_URL,
  NFC_TOOLS_IOS_APP_STORE_URL,
  NFC_TOOLS_IOS_SCHEME,
  buildAndroidIntentUrl,
  getNfcToolsStoreUrl,
  launchAppUrlViaHiddenIframe,
  openNfcTools,
  tryOpenDeepLinkWithStoreFallback,
} from './open-nfc-tools';
import * as pwaInstall from './pwa-install';

describe('open-nfc-tools', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getNfcToolsStoreUrl', () => {
    it('returns Play Store URL on Android', () => {
      expect(getNfcToolsStoreUrl('android')).toBe(NFC_TOOLS_ANDROID_PLAY_STORE_URL);
    });

    it('returns App Store URL on iOS', () => {
      expect(getNfcToolsStoreUrl('ios')).toBe(NFC_TOOLS_IOS_APP_STORE_URL);
    });

    it('returns App Store URL on desktop', () => {
      expect(getNfcToolsStoreUrl('other')).toBe(NFC_TOOLS_IOS_APP_STORE_URL);
    });
  });

  describe('buildAndroidIntentUrl', () => {
    it('includes package, scheme, and encoded Play Store fallback', () => {
      const url = buildAndroidIntentUrl(NFC_TOOLS_ANDROID_PLAY_STORE_URL);

      expect(url).toContain('com.wakdev.wdnfc');
      expect(url).toContain('scheme=nfctools');
      expect(url).toContain(
        `S.browser_fallback_url=${encodeURIComponent(NFC_TOOLS_ANDROID_PLAY_STORE_URL)}`,
      );
      expect(url).toMatch(/^intent:\/\//);
    });
  });

  describe('launchAppUrlViaHiddenIframe', () => {
    it('probes the scheme in a hidden iframe without navigating the main window', () => {
      const iframe = {
        style: { display: '' },
        setAttribute: vi.fn(),
        remove: vi.fn(),
        src: '',
      };
      const appendChild = vi.fn();
      vi.stubGlobal('document', {
        createElement: vi.fn().mockReturnValue(iframe),
        body: { appendChild },
      });

      const cleanup = launchAppUrlViaHiddenIframe(NFC_TOOLS_IOS_SCHEME);

      expect(document.createElement).toHaveBeenCalledWith('iframe');
      expect(iframe.style.display).toBe('none');
      expect(iframe.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
      expect(appendChild).toHaveBeenCalledWith(iframe);
      expect(iframe.src).toBe(NFC_TOOLS_IOS_SCHEME);

      cleanup();
      expect(iframe.remove).toHaveBeenCalled();
    });
  });

  describe('tryOpenDeepLinkWithStoreFallback', () => {
    const storeUrl = NFC_TOOLS_IOS_APP_STORE_URL;

    function createDeps(overrides: Partial<Parameters<typeof tryOpenDeepLinkWithStoreFallback>[3]> = {}) {
      let visibilityHandler: (() => void) | undefined;
      let fallbackCallback: (() => void) | undefined;
      const removeAppLaunch = vi.fn();

      const deps = {
        launchAppUrl: vi.fn().mockReturnValue(removeAppLaunch),
        openWindow: vi.fn(),
        addVisibilityListener: vi.fn((handler: () => void) => {
          visibilityHandler = handler;
          return vi.fn();
        }),
        isDocumentHidden: vi.fn().mockReturnValue(false),
        scheduleFallback: vi.fn((callback: () => void) => {
          fallbackCallback = callback;
          return vi.fn();
        }),
        ...overrides,
      };

      return {
        deps,
        removeAppLaunch,
        getVisibilityHandler: () => visibilityHandler,
        getFallbackCallback: () => fallbackCallback,
      };
    }

    it('launches the app URL immediately via the injected launcher', () => {
      const { deps } = createDeps();

      tryOpenDeepLinkWithStoreFallback(NFC_TOOLS_IOS_SCHEME, storeUrl, 1500, deps);

      expect(deps.launchAppUrl).toHaveBeenCalledWith(NFC_TOOLS_IOS_SCHEME);
    });

    it('opens the store when the page stays visible after the delay', () => {
      const { deps, getFallbackCallback } = createDeps();

      tryOpenDeepLinkWithStoreFallback(NFC_TOOLS_IOS_SCHEME, storeUrl, 1500, deps);
      getFallbackCallback()?.();

      expect(deps.openWindow).toHaveBeenCalledWith(storeUrl);
    });

    it('does not open the store when the document becomes hidden', () => {
      const { deps, getVisibilityHandler, getFallbackCallback } = createDeps({
        isDocumentHidden: vi.fn().mockReturnValue(true),
      });

      tryOpenDeepLinkWithStoreFallback(NFC_TOOLS_IOS_SCHEME, storeUrl, 1500, deps);
      getVisibilityHandler()?.();
      getFallbackCallback()?.();

      expect(deps.openWindow).not.toHaveBeenCalled();
    });

    it('cleans up the app launch probe after fallback', () => {
      const { deps, removeAppLaunch, getFallbackCallback } = createDeps();

      tryOpenDeepLinkWithStoreFallback(NFC_TOOLS_IOS_SCHEME, storeUrl, 1500, deps);
      getFallbackCallback()?.();

      expect(removeAppLaunch).toHaveBeenCalled();
    });
  });

  describe('openNfcTools', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('probes the iOS scheme via hidden iframe instead of location.assign', () => {
      vi.spyOn(pwaInstall, 'detectPwaInstallPlatform').mockReturnValue('ios');
      const iframe = {
        style: { display: '' },
        setAttribute: vi.fn(),
        remove: vi.fn(),
        src: '',
      };
      vi.stubGlobal('document', {
        createElement: vi.fn().mockReturnValue(iframe),
        body: { appendChild: vi.fn() },
        hidden: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      vi.stubGlobal('open', vi.fn());
      vi.stubGlobal('setTimeout', vi.fn(() => 1));
      vi.stubGlobal('clearTimeout', vi.fn());

      openNfcTools();

      expect(iframe.src).toBe(NFC_TOOLS_IOS_SCHEME);
      expect(document.createElement).toHaveBeenCalledWith('iframe');
    });

    it('uses an Android intent URL on Android', () => {
      vi.spyOn(pwaInstall, 'detectPwaInstallPlatform').mockReturnValue('android');
      const assign = vi.fn();
      vi.stubGlobal('location', { assign });

      openNfcTools();

      expect(assign).toHaveBeenCalledWith(buildAndroidIntentUrl(NFC_TOOLS_ANDROID_PLAY_STORE_URL));
    });

    it('opens the App Store in a new tab on desktop', () => {
      vi.spyOn(pwaInstall, 'detectPwaInstallPlatform').mockReturnValue('other');
      const open = vi.fn();
      vi.stubGlobal('open', open);

      openNfcTools();

      expect(open).toHaveBeenCalledWith(
        NFC_TOOLS_IOS_APP_STORE_URL,
        '_blank',
        'noopener,noreferrer',
      );
    });
  });
});
