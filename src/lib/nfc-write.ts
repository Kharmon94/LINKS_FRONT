/**
 * Web NFC write helpers for programming URL records onto NFC tags.
 *
 * Platform expectations:
 * - Android Chrome: NDEFReader.write opens the browser's native NFC scan UI.
 * - iPhone Safari / PWA: Web NFC is unavailable; use a third-party app (e.g. NFC Tools).
 * - Desktop: Same as iOS — guide the user to program tags from a phone.
 */

declare global {
  interface Window {
    NDEFReader?: new () => NdefReader;
  }
}

interface NdefReader {
  write(message: { records: Array<{ recordType: string; data: string }> }): Promise<void>;
}

export function isNfcWriteSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.isSecureContext) return false;
  return 'NDEFReader' in window;
}

export async function writeUrlToNfcTag(url: string): Promise<void> {
  if (!isNfcWriteSupported() || !window.NDEFReader) {
    throw new DOMException('Web NFC is not supported', 'NotSupportedError');
  }

  const reader = new window.NDEFReader();
  await reader.write({
    records: [{ recordType: 'url', data: url }],
  });
}

export function mapNfcWriteError(error: unknown): string {
  const err =
    error instanceof Error
      ? error
      : typeof error === 'object' && error !== null && 'name' in error
        ? (error as { name?: string; message?: string })
        : null;

  if (!err) {
    return 'Could not write to NFC tag. Try again.';
  }

  const name = err.name ?? '';
  const message = (err.message ?? '').toLowerCase();

  if (name === 'NotAllowedError') {
    return 'NFC permission denied. Allow NFC access in your browser settings and try again.';
  }

  if (name === 'NotSupportedError') {
    return 'NFC writing is not supported on this device or browser.';
  }

  if (
    name === 'NotReadableError' ||
    message.includes('read-only') ||
    message.includes('readonly')
  ) {
    return 'This tag is read-only and cannot be overwritten.';
  }

  if (name === 'AbortError' || message.includes('timeout') || message.includes('cancel')) {
    return 'Scan cancelled or timed out. Hold your phone near the tag and try again.';
  }

  if (name === 'NetworkError') {
    return 'Lost connection to the tag. Keep the tag near your phone and try again.';
  }

  return err.message || 'Could not write to NFC tag. Try again.';
}
