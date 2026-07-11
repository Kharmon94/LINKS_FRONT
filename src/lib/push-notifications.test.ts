import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  consumePendingPushSubscribe,
  setPendingPushSubscribe,
} from './pwa-install';

const apiRequestMock = vi.fn().mockResolvedValue({});

vi.mock('@/services/api', () => ({
  apiRequest: (...args: unknown[]) => apiRequestMock(...args),
}));

import {
  consumeAndSubscribePush,
  ensurePushSubscriptionSynced,
  subscribeToPush,
} from './push-notifications';

function mockPushEnvironment(options?: { existingSub?: boolean }) {
  const mockSub = {
    endpoint: 'https://push.example/1',
    toJSON: () => ({ endpoint: 'https://push.example/1' }),
  };
  const mockPushManager = {
    getSubscription: vi
      .fn()
      .mockResolvedValue(options?.existingSub ? mockSub : null),
    subscribe: vi.fn().mockResolvedValue(mockSub),
  };
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { ready: Promise.resolve({ pushManager: mockPushManager }) },
  });
  Object.defineProperty(window, 'Notification', {
    configurable: true,
    value: { permission: 'granted' },
  });
  vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'BMabc123');
  return { mockPushManager, mockSub };
}

describe('push-notifications consume flow', () => {
  beforeEach(() => {
    localStorage.clear();
    apiRequestMock.mockClear();
    mockPushEnvironment();
  });

  it('does nothing when no pending flag', async () => {
    await consumeAndSubscribePush();
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('subscribes and clears pending flag when set', async () => {
    setPendingPushSubscribe();
    await consumeAndSubscribePush();
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/subscribe', expect.any(Object));
    expect(consumePendingPushSubscribe()).toBe(false);
  });

  it('clears pending flag even when subscribe fails', async () => {
    apiRequestMock.mockRejectedValue(new Error('network'));
    setPendingPushSubscribe();
    await consumeAndSubscribePush();
    expect(consumePendingPushSubscribe()).toBe(false);
  });
});

describe('subscribeToPush sync', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    apiRequestMock.mockResolvedValue({});
  });

  it('POSTs existing browser subscription to the API (does not skip sync)', async () => {
    const { mockPushManager } = mockPushEnvironment({ existingSub: true });

    const ok = await subscribeToPush();

    expect(ok).toBe(true);
    expect(mockPushManager.subscribe).not.toHaveBeenCalled();
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription: { endpoint: 'https://push.example/1' } }),
    });
  });

  it('creates a new subscription then POSTs when none exists', async () => {
    const { mockPushManager } = mockPushEnvironment({ existingSub: false });

    const ok = await subscribeToPush();

    expect(ok).toBe(true);
    expect(mockPushManager.subscribe).toHaveBeenCalled();
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/subscribe', expect.any(Object));
  });

  it('returns false when API sync fails', async () => {
    mockPushEnvironment({ existingSub: true });
    apiRequestMock.mockRejectedValue(new Error('network'));

    const ok = await subscribeToPush();

    expect(ok).toBe(false);
  });
});

describe('ensurePushSubscriptionSynced', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    apiRequestMock.mockResolvedValue({});
  });

  it('POSTs when a browser subscription already exists', async () => {
    mockPushEnvironment({ existingSub: true });

    const ok = await ensurePushSubscriptionSynced();

    expect(ok).toBe(true);
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/subscribe', expect.any(Object));
  });

  it('returns false without POSTing when no browser subscription', async () => {
    mockPushEnvironment({ existingSub: false });

    const ok = await ensurePushSubscriptionSynced();

    expect(ok).toBe(false);
    expect(apiRequestMock).not.toHaveBeenCalled();
  });
});
