import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  consumePendingPushSubscribe,
  setPendingPushSubscribe,
} from './pwa-install';

const apiRequestMock = vi.fn().mockResolvedValue({});

vi.mock('@/services/api', () => ({
  apiRequest: (...args: unknown[]) => apiRequestMock(...args),
}));

import { consumeAndSubscribePush } from './push-notifications';

function mockPushEnvironment() {
  const mockSub = { toJSON: () => ({ endpoint: 'https://push.example/1' }) };
  const mockPushManager = {
    getSubscription: vi.fn().mockResolvedValue(null),
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
