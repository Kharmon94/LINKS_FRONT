import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';
import { AuthTopNav } from '../components/nav/auth-top-nav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type VerifyMode = 'sign_in' | 'set_password';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkMagicLinkToken, completeMagicLink } = useAuth();
  const [status, setStatus] = useState<'loading' | 'password' | 'success' | 'error'>('loading');
  const [mode, setMode] = useState<VerifyMode>('set_password');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const tokenChecked = useRef(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided.');
      return;
    }

    if (tokenChecked.current) return;
    if (status === 'password' || status === 'success' || submitting) return;

    tokenChecked.current = true;
    let cancelled = false;

    (async () => {
      const result = await checkMagicLinkToken(token);
      if (cancelled) return;
      if (result.success && result.email) {
        setEmail(result.email);
        setMode(result.mode === 'sign_in' ? 'sign_in' : 'set_password');
        setStatus('password');
      } else {
        setStatus('error');
        setError(result.error || 'This link is invalid or has expired.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, checkMagicLinkToken, status, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'set_password' && password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result =
        mode === 'sign_in'
          ? await completeMagicLink(token, password)
          : await completeMagicLink(token, password, passwordConfirmation);
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
        setError(
          result.error ||
            (mode === 'sign_in' ? 'Incorrect password. Please try again.' : 'Could not set password. Please try again.')
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSignIn = mode === 'sign_in';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AuthTopNav backTo="/auth" backLabel="Sign in" />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-8">
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-muted-foreground" />
            <h1 className="text-3xl mb-2">Verifying link…</h1>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </div>
        )}

        {status === 'password' && (
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="text-3xl mb-2">{isSignIn ? 'Enter your password' : 'Set your password'}</h1>
              <p className="text-muted-foreground text-sm">
                {email ? (
                  isSignIn ? (
                    <>
                      Sign in as <span className="font-medium text-foreground">{email}</span> to continue.
                    </>
                  ) : (
                    <>
                      Create a password for <span className="font-medium text-foreground">{email}</span> to finish
                      signing in.
                    </>
                  )
                ) : isSignIn ? (
                  'Enter your password to finish signing in.'
                ) : (
                  'Create a password to finish signing in.'
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="rounded-full"
                />
              </div>
              {!isSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation">Confirm password</Label>
                  <Input
                    id="passwordConfirmation"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Repeat your password"
                    className="rounded-full"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              >
                {submitting ? (isSignIn ? 'Signing in…' : 'Saving…') : 'Continue to dashboard'}
              </Button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl mb-2">You&apos;re in</h1>
            <p className="text-muted-foreground mb-4">
              {isSignIn ? 'Signed in. Redirecting…' : 'Password saved. Redirecting…'}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl mb-2">Link invalid</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/auth')}
                className="w-full rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              >
                Request new link
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full rounded-full">
                Back to home
              </Button>
            </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
