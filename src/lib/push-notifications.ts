import { apiRequest, ApiError } from '@/services/api';
import { consumePendingPushSubscribe } from '@/lib/pwa-install';

export type PushErrorCode =
  | 'unsupported'
  | 'permission_denied'
  | 'missing_vapid'
  | 'forbidden'
  | 'network'
  | 'unknown';

export type PushResult = { ok: true } | { ok: false; error: PushErrorCode };

export type TestPushResult = {
  ok: boolean;
  sent: number;
  errors: string[];
};

async function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function vapidPublicKey(): string | undefined {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  return key?.trim() || undefined;
}

function classifySyncError(err: unknown): PushErrorCode {
  if (err instanceof ApiError) {
    if (err.status === 403) return 'forbidden';
    if (err.status === 0 || err.status >= 500) return 'network';
    return 'unknown';
  }
  if (err instanceof TypeError) return 'network';
  return 'unknown';
}

async function postSubscriptionToApi(sub: PushSubscription): Promise<void> {
  await apiRequest('/api/v1/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });
}

async function subscribeWithCurrentVapid(
  pushManager: PushManager,
): Promise<{ ok: true; sub: PushSubscription } | { ok: false; error: PushErrorCode }> {
  const publicKey = vapidPublicKey();
  if (!publicKey) return { ok: false, error: 'missing_vapid' };

  try {
    const sub = await pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: await urlBase64ToUint8Array(publicKey),
    });
    return { ok: true, sub };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}

/**
 * POSTs a subscription; on 4xx, unsubscribes and re-subscribes with the current
 * VITE_VAPID_PUBLIC_KEY, then POSTs again (heals VAPID / stale endpoint mismatches).
 */
async function syncSubscriptionWithResubscribe(
  pushManager: PushManager,
  sub: PushSubscription,
): Promise<PushResult> {
  try {
    await postSubscriptionToApi(sub);
    return { ok: true };
  } catch (err) {
    const isClientError = err instanceof ApiError && err.status >= 400 && err.status < 500;
    if (!isClientError) {
      return { ok: false, error: classifySyncError(err) };
    }

    try {
      await sub.unsubscribe();
    } catch {
      // Continue — browser may already have dropped the subscription.
    }

    const fresh = await subscribeWithCurrentVapid(pushManager);
    if (!fresh.ok) return fresh;

    try {
      await postSubscriptionToApi(fresh.sub);
      return { ok: true };
    } catch (retryErr) {
      return { ok: false, error: classifySyncError(retryErr) };
    }
  }
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  return Notification.requestPermission();
}

/**
 * Ensures the browser PushSubscription (if any) is upserted to the API.
 * Returns ok only when a subscription exists and was synced successfully.
 * When there is nothing to sync, returns permission_denied (not a sync failure).
 */
export async function ensurePushSubscriptionSynced(): Promise<PushResult> {
  if (!isPushSupported()) return { ok: false, error: 'unsupported' };
  if (Notification.permission !== 'granted') return { ok: false, error: 'permission_denied' };

  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (!existing) return { ok: false, error: 'permission_denied' };
    return syncSubscriptionWithResubscribe(reg.pushManager, existing);
  } catch (err) {
    return { ok: false, error: classifySyncError(err) };
  }
}

export async function subscribeToPush(): Promise<PushResult> {
  if (!isPushSupported()) return { ok: false, error: 'unsupported' };

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      const fresh = await subscribeWithCurrentVapid(reg.pushManager);
      if (!fresh.ok) return fresh;
      sub = fresh.sub;
      try {
        await postSubscriptionToApi(sub);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: classifySyncError(err) };
      }
    }

    return syncSubscriptionWithResubscribe(reg.pushManager, sub);
  } catch (err) {
    return { ok: false, error: classifySyncError(err) };
  }
}

export async function enablePushNotifications(): Promise<PushResult> {
  if (!isPushSupported()) return { ok: false, error: 'unsupported' };
  const perm = await requestPushPermission();
  if (perm !== 'granted') return { ok: false, error: 'permission_denied' };
  return subscribeToPush();
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await apiRequest('/api/v1/push/unsubscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  }
}

export async function sendTestPush(): Promise<TestPushResult> {
  return apiRequest<TestPushResult>('/api/v1/push/test', { method: 'POST' });
}

export function pushErrorMessage(error: PushErrorCode): string {
  switch (error) {
    case 'missing_vapid':
      return 'Missing VAPID public key — set VITE_VAPID_PUBLIC_KEY and rebuild';
    case 'forbidden':
      return 'Push is disabled for this account (feature flag)';
    case 'network':
      return 'Could not reach the server to sync push';
    case 'permission_denied':
      return 'Notification permission was denied';
    case 'unsupported':
      return 'Push notifications are not supported in this browser';
    default:
      return 'Could not sync push to server — check feature flag / VAPID';
  }
}

export async function consumeAndSubscribePush(): Promise<void> {
  if (!consumePendingPushSubscribe()) return;
  try {
    await subscribeToPush();
  } catch {
    // Subscription may fail if auth or SW not ready; user can retry in settings.
  }
}
