import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { useAuth } from '../contexts/auth-context';
import { Mail, ArrowRight, Lock } from 'lucide-react';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { sendMagicLink, loginWithGoogle, signInWithPassword } = useAuth();

  useEffect(() => {
    const r = searchParams.get('returnTo');
    if (r) {
      try {
        sessionStorage.setItem('post_auth_redirect', decodeURIComponent(r));
      } catch {
        sessionStorage.setItem('post_auth_redirect', r);
      }
    } else {
      sessionStorage.removeItem('post_auth_redirect');
    }
  }, [searchParams]);

  const redirectAfterAuth = () => {
    const dest = sessionStorage.getItem('post_auth_redirect') || '/dashboard';
    sessionStorage.removeItem('post_auth_redirect');
    navigate(dest);
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      if (result.success) {
        toast.success('Signed in successfully');
        redirectAfterAuth();
      } else {
        setError(result.error || 'Incorrect email or password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sendMagicLink(email);
      setLoading(false);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message || 'Failed to send magic link');
      }
    } catch {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleGoogleAuth = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header customNavItems={[
        { label: 'Products', href: 'https://www.blackcollar.io' },
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'Pricing', href: '/pricing' },
      ]} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32">
        <div className="w-full max-w-md">
          {!isSubmitted ? (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl mb-2">Welcome Back</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Sign in with your password, Google, or a magic link
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 rounded-full mb-6"
                onClick={handleGoogleAuth}
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or sign in with email</span>
                </div>
              </div>

              <form onSubmit={handlePasswordSignIn} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 sm:h-12 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your account password"
                    className="h-11 sm:h-12 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="w-full h-11 sm:h-12 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90" 
                  size="lg"
                >
                  {passwordLoading ? 'Signing in...' : 'Sign in with password'}
                  {!passwordLoading && <Lock className="w-5 h-5 ml-2" />}
                </Button>
              </form>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or use magic link</span>
                </div>
              </div>

              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <Button 
                  type="submit" 
                  disabled={loading || !email}
                  variant="outline"
                  className="w-full h-11 sm:h-12 rounded-full" 
                  size="lg"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  First time? Use a magic link to set your password once. Returning users can sign in with the password they chose.
                </p>
              </div>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                  By continuing, you agree to our{' '}
                  <button type="button" className="text-foreground hover:underline text-[13px]">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-foreground hover:underline text-[13px]">Privacy Policy</button>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-black dark:text-white" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl mb-4">Check Your Email</h1>
              
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                We sent a magic link to <strong className="text-foreground">{email}</strong>
              </p>

              <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-2">
                  Click the link in the email to continue. First-time users will set a password; returning users enter their existing password.
                </p>
                <p className="text-sm text-muted-foreground">
                  Can't find it? Check your spam folder.
                </p>
              </div>

              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setIsSubmitted(false);
                }}
              >
                Use a different email
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}
