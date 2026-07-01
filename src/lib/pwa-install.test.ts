import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectPwaInstallPlatform,
  hasSeenPwaInstallPrompt,
  isAuthenticatedAppRoute,
  markPwaInstallPromptSeen,
} from './pwa-install';

describe('pwa-install', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tracks dismissed prompt per user', () => {
    expect(hasSeenPwaInstallPrompt('user-1')).toBe(false);
    markPwaInstallPromptSeen('user-1');
    expect(hasSeenPwaInstallPrompt('user-1')).toBe(true);
    expect(hasSeenPwaInstallPrompt('user-2')).toBe(false);
  });

  it('detects platform from user agent', () => {
    const original = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    });
    expect(detectPwaInstallPlatform()).toBe('ios');
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: original,
    });
  });

  it('limits prompt to authenticated app routes', () => {
    expect(isAuthenticatedAppRoute('/dashboard')).toBe(true);
    expect(isAuthenticatedAppRoute('/links')).toBe(true);
    expect(isAuthenticatedAppRoute('/auth')).toBe(false);
    expect(isAuthenticatedAppRoute('/auth/oauth-complete')).toBe(false);
    expect(isAuthenticatedAppRoute('/')).toBe(false);
    expect(isAuthenticatedAppRoute('/pricing')).toBe(false);
  });
});
