import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User } from '@/types';
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  persistAuth,
  readStoredAuthState,
} from '@/lib/auth-storage';
import { isJwtExpired } from '@/lib/jwt';
import { isStandalonePwa } from '@/lib/pwa-install';
import { consumeAndSubscribePush } from '@/lib/push-notifications';
import { apiRequest, apiBase, ApiError } from '@/services/api';
import { signInWithPassword as apiSignIn } from '@/services/account-api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message?: string }>;
  checkMagicLinkToken: (
    token: string
  ) => Promise<{
    success: boolean;
    signedIn?: boolean;
    email?: string;
    name?: string;
    mode?: 'set_password';
    error?: string;
  }>;
  completeMagicLink: (
    token: string,
    password: string,
    passwordConfirmation?: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginWithGoogle: () => void;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type SessionResponse = {
  user: User;
  token?: string;
};

async function fetchSession(maxAttempts = isStandalonePwa() ? 5 : 3): Promise<SessionResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await apiRequest<SessionResponse>('/api/auth/session', { method: 'GET' });
    } catch (e) {
      lastError = e;
      if (e instanceof ApiError && e.status === 401) throw e;
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = readStoredAuthState();
  const [isAuthenticated, setIsAuthenticated] = useState(initial.isAuthenticated);
  const [user, setUser] = useState<User | null>(initial.user);
  const [loading, setLoading] = useState(initial.loading);
  const initialAuthDone = useRef(false);

  const applySession = useCallback((sessionUser: User, token: string) => {
    persistAuth(token, sessionUser);
    setUser(sessionUser);
    setIsAuthenticated(true);
    void consumeAndSubscribePush();
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }

    if (isJwtExpired(token)) {
      clearAuthStorage();
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }

    const cachedUser = getStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
      setIsAuthenticated(true);
    }

    try {
      const data = await fetchSession();
      const nextToken = data.token ?? token;
      applySession(data.user, nextToken);
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      // Transient failure (offline, cold PWA start): keep cached session alive.
      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
        return true;
      }

      // Token without cached profile — stay signed in until the server rejects the token.
      if (token && !isJwtExpired(token)) {
        setIsAuthenticated(true);
        return true;
      }

      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    void checkAuth().finally(() => {
      initialAuthDone.current = true;
    });
  }, [checkAuth]);

  useEffect(() => {
    const refreshSession = () => {
      if (!initialAuthDone.current) return;
      const token = getStoredToken();
      if (token && !isJwtExpired(token)) {
        void checkAuth();
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshSession();
    };
    window.addEventListener('focus', refreshSession);
    window.addEventListener('pageshow', refreshSession);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', refreshSession);
      window.removeEventListener('pageshow', refreshSession);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [checkAuth]);

  const sendMagicLink = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await apiRequest<{ message: string }>('/api/auth/magic-link', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: true, message: 'Magic link sent! Check your email.' };
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Network error. Please try again.';
      return { success: false, message: msg };
    }
  };

  const checkMagicLinkToken = useCallback(
    async (
      token: string
    ): Promise<{
      success: boolean;
      signedIn?: boolean;
      email?: string;
      name?: string;
      mode?: 'set_password';
      error?: string;
    }> => {
      try {
        const data = await apiRequest<{
          user?: User;
          token?: string;
          requiresPassword?: boolean;
          email?: string;
          name?: string;
          mode?: 'set_password';
        }>('/api/auth/verify', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        if (data.user && data.token) {
          applySession(data.user, data.token);
          return { success: true, signedIn: true };
        }
        if (data.requiresPassword && data.email) {
          return {
            success: true,
            email: data.email,
            name: data.name,
            mode: 'set_password',
          };
        }
        return { success: false, error: 'Invalid link response.' };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Network error. Please try again.';
        return { success: false, error: msg };
      }
    },
    [applySession]
  );

  const completeMagicLink = useCallback(
    async (
      token: string,
      password: string,
      passwordConfirmation?: string
    ): Promise<{ success: boolean; user?: User; error?: string }> => {
      try {
        const body: Record<string, string> = { token, password };
        if (passwordConfirmation !== undefined) {
          body.password_confirmation = passwordConfirmation;
        }
        const data = await apiRequest<{ user: User; token: string }>('/api/auth/verify', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        applySession(data.user, data.token);
        return { success: true, user: data.user };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Network error. Please try again.';
        return { success: false, error: msg };
      }
    },
    [applySession]
  );

  const loginWithGoogle = () => {
    const fromProtected = sessionStorage.getItem('post_auth_redirect');
    const dest =
      fromProtected ||
      (window.location.pathname !== '/auth' && window.location.pathname !== '/'
        ? `${window.location.pathname}${window.location.search}`
        : '/links');
    sessionStorage.setItem('oauth_return_to', dest);
    const base = apiBase();
    window.location.href = `${base}/users/auth/google_oauth2`;
  };

  const signInWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await apiSignIn(email, password);
      applySession(data.user, data.token);
      return { success: true };
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Network error. Please try again.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'DELETE' });
    } catch {
      /* ignore */
    } finally {
      clearAuthStorage();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        sendMagicLink,
        checkMagicLinkToken,
        completeMagicLink,
        loginWithGoogle,
        signInWithPassword,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
