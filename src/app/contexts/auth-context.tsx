import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { apiRequest, setStoredToken, getStoredToken, apiBase, ApiError } from '@/services/api';
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
    email?: string;
    name?: string;
    mode?: 'sign_in' | 'set_password';
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
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const data = await apiRequest<{ user: User }>('/api/auth/session', {
        method: 'GET',
      });
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setStoredToken(null);
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
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
      email?: string;
      name?: string;
      mode?: 'sign_in' | 'set_password';
      error?: string;
    }> => {
      try {
        const data = await apiRequest<{
          requiresPassword?: boolean;
          email?: string;
          name?: string;
          mode?: 'sign_in' | 'set_password';
        }>('/api/auth/verify', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        if (data.requiresPassword && data.email) {
          return {
            success: true,
            email: data.email,
            name: data.name,
            mode: data.mode === 'sign_in' ? 'sign_in' : 'set_password',
          };
        }
        return { success: false, error: 'Invalid link response.' };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Network error. Please try again.';
        return { success: false, error: msg };
      }
    },
    []
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
        if (data.token) setStoredToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Network error. Please try again.';
        return { success: false, error: msg };
      }
    },
    []
  );

  const loginWithGoogle = () => {
    const fromProtected = sessionStorage.getItem('post_auth_redirect');
    const dest =
      fromProtected ||
      (window.location.pathname !== '/auth' && window.location.pathname !== '/'
        ? `${window.location.pathname}${window.location.search}`
        : '/dashboard');
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
      if (data.token) setStoredToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
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
      setStoredToken(null);
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
