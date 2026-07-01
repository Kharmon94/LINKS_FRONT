import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NFC_TOOLS_ANDROID_PLAY_STORE_URL,
  NFC_TOOLS_IOS_APP_STORE_URL,
  getNfcToolsStoreUrl,
  openNfcTools,
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

  describe('openNfcTools', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('opens the App Store in a new tab on iOS', () => {
      vi.spyOn(pwaInstall, 'detectPwaInstallPlatform').mockReturnValue('ios');
      const open = vi.fn();
      vi.stubGlobal('open', open);

      openNfcTools();

      expect(open).toHaveBeenCalledWith(
        NFC_TOOLS_IOS_APP_STORE_URL,
        '_blank',
        'noopener,noreferrer',
      );
    });

    it('opens the Play Store in a new tab on Android', () => {
      vi.spyOn(pwaInstall, 'detectPwaInstallPlatform').mockReturnValue('android');
      const open = vi.fn();
      vi.stubGlobal('open', open);

      openNfcTools();

      expect(open).toHaveBeenCalledWith(
        NFC_TOOLS_ANDROID_PLAY_STORE_URL,
        '_blank',
        'noopener,noreferrer',
      );
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
