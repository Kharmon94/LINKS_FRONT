import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, ApiError } from './api';
import { clearAuthStorage, setStoredToken } from '@/lib/auth-storage';

describe('apiRequest', () => {
  beforeEach(() => {
    clearAuthStorage();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws ApiError on 401 and clears token', async () => {
    localStorage.setItem('auth_token', 'bad');
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Unauthorized' }),
    } as Response);

    await expect(apiRequest('/api/auth/session')).rejects.toBeInstanceOf(ApiError);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
