import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/auth-context';
import { acceptTeamInvitation, previewTeamInvitation } from '@/services/team-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await previewTeamInvitation(token);
        if (!cancelled) {
          setTeamName(data.invitation.teamName || 'Team');
          setEmail(data.invitation.email);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'Invitation not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    if (!isAuthenticated) {
      const returnPath = `/accept-invite/${token}`;
      sessionStorage.setItem('post_auth_redirect', returnPath);
      navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`);
      return;
    }
    setAccepting(true);
    try {
      await acceptTeamInvitation(token);
      await checkAuth();
      toast.success('Invitation accepted');
      navigate('/team');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-card rounded-lg p-8 shadow-lg text-center">
          {loading ? (
            <p className="text-muted-foreground">Loading invitation...</p>
          ) : error ? (
            <>
              <h1 className="text-2xl font-semibold mb-2">Invitation unavailable</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('/auth')}>Go to sign in</Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold mb-2">Join {teamName}</h1>
              <p className="text-muted-foreground mb-6">
                You&apos;ve been invited to collaborate as <strong>{email}</strong>.
              </p>
              <Button className="w-full" onClick={handleAccept} disabled={accepting}>
                {accepting ? 'Accepting...' : isAuthenticated ? 'Accept invitation' : 'Sign in to accept'}
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
