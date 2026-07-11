import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  consumePendingPushSubscribe,
  setPendingPushSubscribe,
} from './pwa-install';
import { ApiError } from '@/services/api';

const apiRequestMock = vi.fn().mockResolvedValue({});

vi.mock('@/services/api', async () => {
  class MockApiError extends Error {
    status: number;
    body: unknown;
    constructor(message: string, status: number, body?: unknown) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.body = body;
    }
  }
  return {
    apiRequest: (...args: unknown[]) => apiRequestMock(...args),
    ApiError: MockApiError,
  };
});

import {
  consumeAndSubscribePush,
  ensurePushSubscriptionSynced,
  sendTestPush,
  subscribeToPush,
} from './push-notifications';

function mockPushEnvironment(options?: {
  existingSub?: boolean;
  withUnsubscribe?: boolean;
}) {
  const mockSub = {
    endpoint: 'https://push.example/1',
    toJSON: () => ({ endpoint: 'https://push.example/1' }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  };
  const freshSub = {
    endpoint: 'https://push.example/2',
    toJSON: () => ({ endpoint: 'https://push.example/2' }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  };
  const mockPushManager = {
    getSubscription: vi
      .fn()
      .mockResolvedValue(options?.existingSub ? mockSub : null),
    subscribe: vi.fn().mockResolvedValue(options?.withUnsubscribe ? freshSub : mockSub),
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
  return { mockPushManager, mockSub, freshSub };
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

    const result = await subscribeToPush();

    expect(result).toEqual({ ok: true });
    expect(mockPushManager.subscribe).not.toHaveBeenCalled();
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription: { endpoint: 'https://push.example/1' } }),
    });
  });

  it('creates a new subscription then POSTs when none exists', async () => {
    const { mockPushManager } = mockPushEnvironment({ existingSub: false });

    const result = await subscribeToPush();

    expect(result).toEqual({ ok: true });
    expect(mockPushManager.subscribe).toHaveBeenCalled();
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/subscribe', expect.any(Object));
  });

  it('returns missing_vapid when key is absent and no existing sub', async () => {
    mockPushEnvironment({ existingSub: false });
    vi.stubEnv('VITE_VAPID_PUBLIC_KEY', '');

    const result = await subscribeToPush();

    expect(result).toEqual({ ok: false, error: 'missing_vapid' });
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('returns network when API sync fails with non-4xx', async () => {
    mockPushEnvironment({ existingSub: true });
    apiRequestMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await subscribeToPush();

    expect(result).toEqual({ ok: false, error: 'network' });
  });

  it('resubscribes then POSTs again when existing sync returns 4xx', async () => {
    const { mockPushManager, mockSub, freshSub } = mockPushEnvironment({
      existingSub: true,
      withUnsubscribe: true,
    });
    apiRequestMock
      .mockRejectedValueOnce(new ApiError('bad vapid', 400))
      .mockResolvedValueOnce({});

    const result = await subscribeToPush();

    expect(result).toEqual({ ok: true });
    expect(mockSub.unsubscribe).toHaveBeenCalled();
    expect(mockPushManager.subscribe).toHaveBeenCalled();
    expect(apiRequestMock).toHaveBeenCalledTimes(2);
    expect(apiRequestMock).toHaveBeenLastCalledWith('/api/v1/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription: { endpoint: freshSub.endpoint } }),
    });
  });

  it('returns forbidden when resubscribe POST still gets 403', async () => {
    mockPushEnvironment({ existingSub: true, withUnsubscribe: true });
    apiRequestMock
      .mockRejectedValueOnce(new ApiError('forbidden', 403))
      .mockRejectedValueOnce(new ApiError('forbidden', 403));

    const result = await subscribeToPush();

    expect(result).toEqual({ ok: false, error: 'forbidden' });
  });
});

describe('ensurePushSubscriptionSynced', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    apiRequestMock.mockResolvedValue({});
  });

  it('POSTs when a browser subscription already exists', async () => {
    mockPushEnvironment({ existingSub: true });

    const result = await ensurePushSubscriptionSynced();

    expect(result).toEqual({ ok: true });
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/subscribe', expect.any(Object));
  });

  it('returns permission_denied without POSTing when no browser subscription', async () => {
    mockPushEnvironment({ existingSub: false });

    const result = await ensurePushSubscriptionSynced();

    expect(result).toEqual({ ok: false, error: 'permission_denied' });
    expect(apiRequestMock).not.toHaveBeenCalled();
  });
});

describe('sendTestPush', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('POSTs to /api/v1/push/test', async () => {
    apiRequestMock.mockResolvedValue({ ok: true, sent: 1, errors: [] });

    const result = await sendTestPush();

    expect(result).toEqual({ ok: true, sent: 1, errors: [] });
    expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/push/test', { method: 'POST' });
  });
});
