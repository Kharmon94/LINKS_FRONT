import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyMagicLink(token);

        if (result.success) {
          setStatus('success');
          const dest =
            sessionStorage.getItem('post_auth_redirect') ||
            (() => {
              const p = new URLSearchParams(window.location.search);
              const r = p.get('returnTo');
              return r ? decodeURIComponent(r) : '/dashboard';
            })();
          sessionStorage.removeItem('post_auth_redirect');
          setTimeout(() => {
            navigate(dest, { replace: true });
          }, 1200);
        } else {
          setStatus('error');
          setError(result.error || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setError('Verification failed. Please try again.');
      }
    };

    verify();
  }, [searchParams, verifyMagicLink, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-muted-foreground" />
            <h1 className="text-3xl mb-2">Verifying...</h1>
            <p className="text-muted-foreground">Please wait while we sign you in.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl mb-2">Success!</h1>
            <p className="text-muted-foreground mb-4">You've been signed in successfully.</p>
            <p className="text-sm text-muted-foreground">Redirecting…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/auth')}
                className="w-full rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              >
                Request New Link
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full rounded-full">
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
