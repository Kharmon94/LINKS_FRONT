import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearPwaInstallConfirmed,
  consumePendingPushSubscribe,
  detectPwaInstallPlatform,
  dismissInstallBannerForSession,
  hasPwaInstallConfirmed,
  hasSeenPwaInstallPrompt,
  isAuthenticatedAppRoute,
  isInstallBannerDismissedForSession,
  isPwaInstallDetectedOnServer,
  isPwaOnboardingComplete,
  markPwaInstallConfirmed,
  markPwaInstallPromptSeen,
  markPwaOnboardingComplete,
  setInstallBannerActive,
  setPendingPushSubscribe,
  shouldShowInstallBanner,
} from './pwa-install';

describe('pwa-install', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('tracks confirmed install per user via localStorage only', () => {
    expect(hasPwaInstallConfirmed('user-1')).toBe(false);
    markPwaInstallConfirmed('user-1');
    expect(hasPwaInstallConfirmed('user-1')).toBe(true);
    expect(hasPwaInstallConfirmed('user-2')).toBe(false);
  });

  it('does not treat server pwaInstalledAt as prompt suppression', () => {
    expect(hasPwaInstallConfirmed('user-1')).toBe(false);
    expect(isPwaInstallDetectedOnServer({ pwaInstalledAt: null })).toBe(false);
    expect(isPwaInstallDetectedOnServer({ pwaInstalledAt: '2026-07-02T12:00:00Z' })).toBe(
      true
    );
  });

  it('clears local install confirmation', () => {
    markPwaInstallConfirmed('user-1');
    expect(hasPwaInstallConfirmed('user-1')).toBe(true);
    clearPwaInstallConfirmed('user-1');
    expect(hasPwaInstallConfirmed('user-1')).toBe(false);
  });

  it('keeps deprecated dismiss helpers aligned with confirmed install', () => {
    expect(hasSeenPwaInstallPrompt('user-1')).toBe(false);
    markPwaInstallPromptSeen('user-1');
    expect(hasSeenPwaInstallPrompt('user-1')).toBe(true);
  });

  it('clears install banner when install is confirmed', () => {
    setInstallBannerActive(true);
    expect(shouldShowInstallBanner()).toBe(true);
    markPwaInstallConfirmed('user-1');
    expect(shouldShowInstallBanner()).toBe(false);
  });

  it('tracks session banner dismiss without clearing banner active flag', () => {
    setInstallBannerActive(true);
    expect(isInstallBannerDismissedForSession()).toBe(false);
    dismissInstallBannerForSession();
    expect(isInstallBannerDismissedForSession()).toBe(true);
    expect(shouldShowInstallBanner()).toBe(true);
  });

  it('tracks onboarding completion per device', () => {
    expect(isPwaOnboardingComplete()).toBe(false);
    markPwaOnboardingComplete();
    expect(isPwaOnboardingComplete()).toBe(true);
  });

  it('tracks install banner active state', () => {
    expect(shouldShowInstallBanner()).toBe(false);
    setInstallBannerActive(true);
    expect(shouldShowInstallBanner()).toBe(true);
    setInstallBannerActive(false);
    expect(shouldShowInstallBanner()).toBe(false);
  });

  it('stores and consumes pending push subscribe flag', () => {
    expect(consumePendingPushSubscribe()).toBe(false);
    setPendingPushSubscribe();
    expect(consumePendingPushSubscribe()).toBe(true);
    expect(consumePendingPushSubscribe()).toBe(false);
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
    expect(isAuthenticatedAppRoute('/pwa/onboarding')).toBe(false);
  });
});
