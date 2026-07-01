import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAuthStorage,
  persistAuth,
  readStoredAuthState,
  setStoredToken,
} from './auth-storage';
import type { User } from '@/types';

function makeToken(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ sub: '42', exp }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.sig`;
}

const sampleUser: User = {
  id: '42',
  email: 'user@example.com',
  name: 'User',
  subscriptionTier: 'free',
  role: 'owner',
  permissions: {},
};

describe('readStoredAuthState', () => {
  beforeEach(() => {
    clearAuthStorage();
  });

  it('returns unauthenticated when storage is empty', () => {
    expect(readStoredAuthState()).toEqual({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  });

  it('restores cached user and keeps loading until session refresh', () => {
    const token = makeToken(Math.floor(Date.now() / 1000) + 3600);
    persistAuth(token, sampleUser);

    expect(readStoredAuthState()).toEqual({
      user: sampleUser,
      isAuthenticated: true,
      loading: true,
    });
  });

  it('restores authenticated state when only token is stored', () => {
    const token = makeToken(Math.floor(Date.now() / 1000) + 3600);
    setStoredToken(token);

    expect(readStoredAuthState()).toEqual({
      user: null,
      isAuthenticated: true,
      loading: true,
    });
  });

  it('clears expired tokens on restore', () => {
    const token = makeToken(1);
    persistAuth(token, sampleUser);

    expect(readStoredAuthState()).toEqual({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
