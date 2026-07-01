import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isNfcWriteSupported, writeUrlToNfcTag, mapNfcWriteError } from './nfc-write';

describe('nfc-write', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as Window & { NDEFReader?: unknown }).NDEFReader;
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    });
  });

  describe('isNfcWriteSupported', () => {
    it('returns false when NDEFReader is missing', () => {
      expect(isNfcWriteSupported()).toBe(false);
    });

    it('returns false when not in a secure context', () => {
      (window as Window & { NDEFReader?: unknown }).NDEFReader = class {};
      Object.defineProperty(window, 'isSecureContext', {
        configurable: true,
        value: false,
      });
      expect(isNfcWriteSupported()).toBe(false);
    });

    it('returns true when NDEFReader exists and context is secure', () => {
      (window as Window & { NDEFReader?: unknown }).NDEFReader = class {};
      expect(isNfcWriteSupported()).toBe(true);
    });
  });

  describe('writeUrlToNfcTag', () => {
    it('calls NDEFReader.write with the URL record', async () => {
      const write = vi.fn().mockResolvedValue(undefined);
      (window as Window & { NDEFReader?: unknown }).NDEFReader = class {
        write = write;
      };

      await writeUrlToNfcTag('https://links.example/abc');

      expect(write).toHaveBeenCalledWith({
        records: [{ recordType: 'url', data: 'https://links.example/abc' }],
      });
    });

    it('throws NotSupportedError when Web NFC is unavailable', async () => {
      await expect(writeUrlToNfcTag('https://links.example/abc')).rejects.toMatchObject({
        name: 'NotSupportedError',
      });
    });
  });

  describe('mapNfcWriteError', () => {
    it('maps NotAllowedError to a permission message', () => {
      const message = mapNfcWriteError(new DOMException('denied', 'NotAllowedError'));
      expect(message).toMatch(/permission denied/i);
    });

    it('maps NotSupportedError to an unsupported message', () => {
      const message = mapNfcWriteError(new DOMException('not supported', 'NotSupportedError'));
      expect(message).toMatch(/not supported/i);
    });

    it('maps read-only tag errors', () => {
      const message = mapNfcWriteError(new DOMException('Tag is read-only', 'NotReadableError'));
      expect(message).toMatch(/read-only/i);
    });

    it('maps AbortError to a scan timeout message', () => {
      const message = mapNfcWriteError(new DOMException('Aborted', 'AbortError'));
      expect(message).toMatch(/cancelled|timed out/i);
    });

    it('returns a generic message for unknown errors', () => {
      expect(mapNfcWriteError('unexpected')).toMatch(/could not write/i);
    });
  });
});
