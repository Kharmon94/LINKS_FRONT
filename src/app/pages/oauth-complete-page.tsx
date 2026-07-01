import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { setStoredToken } from '@/services/api';
import { useAuth } from '../contexts/auth-context';
import { AuthTopNav } from '../components/nav/auth-top-nav';

export function OAuthCompletePage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    if (!token) {
      setError('Missing token');
      return;
    }
    setStoredToken(decodeURIComponent(token));
    window.history.replaceState(null, '', window.location.pathname);
    checkAuth()
      .then(() => {
        const dest =
          sessionStorage.getItem('post_auth_redirect') ||
          sessionStorage.getItem('oauth_return_to') ||
          '/dashboard';
        sessionStorage.removeItem('post_auth_redirect');
        sessionStorage.removeItem('oauth_return_to');
        navigate(dest, { replace: true });
      })
      .catch(() => setError('Could not complete sign-in'));
  }, [checkAuth, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AuthTopNav backTo="/auth" backLabel="Sign in" />
        <main className="flex-1 flex items-center justify-center p-6 pt-24">
          <p className="text-destructive">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthTopNav backTo="/auth" backLabel="Sign in" />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 pt-24">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Completing sign-in…</p>
      </main>
    </div>
  );
}
