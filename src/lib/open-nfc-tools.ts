import { detectPwaInstallPlatform, type PwaInstallPlatform } from './pwa-install';

export const NFC_TOOLS_IOS_APP_STORE_URL =
  'https://apps.apple.com/app/nfc-tools/id1252962749';
export const NFC_TOOLS_ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.wakdev.wdnfc';

export function getNfcToolsStoreUrl(platform: PwaInstallPlatform): string {
  if (platform === 'android') return NFC_TOOLS_ANDROID_PLAY_STORE_URL;
  return NFC_TOOLS_IOS_APP_STORE_URL;
}

export function openNfcTools(): void {
  const platform = detectPwaInstallPlatform();
  const storeUrl = getNfcToolsStoreUrl(platform);
  window.open(storeUrl, '_blank', 'noopener,noreferrer');
}
