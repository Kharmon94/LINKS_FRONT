import type { User } from '@/types';
import { isJwtExpired } from '@/lib/jwt';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export type StoredAuthState = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
};

function safeStorage(
  op: (storage: Storage) => void,
): void {
  try {
    op(localStorage);
  } catch {
    // iOS private mode / storage quota — ignore write failures.
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function persistAuth(token: string, user: User): void {
  safeStorage((storage) => {
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
  });
}

export function setStoredToken(token: string | null): void {
  safeStorage((storage) => {
    if (token) storage.setItem(TOKEN_KEY, token);
    else storage.removeItem(TOKEN_KEY);
  });
}

export function clearAuthStorage(): void {
  safeStorage((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
  });
}

/** Restore auth UI state from localStorage before the session API responds. */
export function readStoredAuthState(nowMs: number = Date.now()): StoredAuthState {
  const token = getStoredToken();
  if (!token) {
    return { user: null, isAuthenticated: false, loading: false };
  }

  if (isJwtExpired(token, 60, nowMs)) {
    clearAuthStorage();
    return { user: null, isAuthenticated: false, loading: false };
  }

  return {
    user: getStoredUser(),
    isAuthenticated: true,
    loading: true,
  };
}
