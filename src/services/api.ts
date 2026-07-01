import {
  clearAuthStorage,
  getStoredToken,
  setStoredToken,
} from '@/lib/auth-storage';

export { clearAuthStorage, getStoredToken, setStoredToken } from '@/lib/auth-storage';

/** Base URL for Rails (no trailing slash). In dev with empty VITE_API_URL, use same-origin + Vite proxy. */
export function apiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw && raw.length > 0) return raw.replace(/\/$/, '');
  if (import.meta.env.DEV) return '';
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('blackcollar.io')) {
    return 'https://api.blackcollar.io';
  }
  return 'http://localhost:3000';
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${apiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    clearAuthStorage();
    throw new ApiError('Unauthorized', 401);
  }

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: string }).error)
        : res.statusText;
    throw new ApiError(msg || 'Request failed', res.status, data);
  }

  return data as T;
}
