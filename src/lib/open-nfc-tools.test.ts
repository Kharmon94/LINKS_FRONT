import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NFC_TOOLS_ANDROID_PLAY_STORE_URL,
  NFC_TOOLS_IOS_APP_STORE_URL,
  NFC_TOOLS_IOS_SCHEME,
  buildAndroidIntentUrl,
  getNfcToolsStoreUrl,
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

  describe('tryOpenDeepLinkWithStoreFallback', () => {
    const storeUrl = NFC_TOOLS_IOS_APP_STORE_URL;

    function createDeps(overrides: Partial<Parameters<typeof tryOpenDeepLinkWithStoreFallback>[3]> = {}) {
      let visibilityHandler: (() => void) | undefined;
      let fallbackCallback: (() => void) | undefined;

      const deps = {
        assignLocation: vi.fn(),
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

      return { deps, getVisibilityHandler: () => visibilityHandler, getFallbackCallback: () => fallbackCallback };
    }

    it('assigns the app URL immediately', () => {
      const { deps } = createDeps();

      tryOpenDeepLinkWithStoreFallback(NFC_TOOLS_IOS_SCHEME, storeUrl, 1500, deps);

      expect(deps.assignLocation).toHaveBeenCalledWith(NFC_TOOLS_IOS_SCHEME);
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
  });

  describe('openNfcTools', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('tries the iOS deep link on iPhone', () => {
      vi.spyOn(pwaInstall, 'detectPwaInstallPlatform').mockReturnValue('ios');
      const assign = vi.fn();
      vi.stubGlobal('location', { assign });

      openNfcTools();

      expect(assign).toHaveBeenCalledWith(NFC_TOOLS_IOS_SCHEME);
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
