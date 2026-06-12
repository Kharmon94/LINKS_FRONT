import { Link } from 'react-router';
import { ShieldOff } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '@/app/contexts/auth-context';

export function AdminAccessDenied() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full bg-card rounded-lg border p-8 text-center space-y-4">
        <ShieldOff className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          Your account is signed in but does not have platform admin access. Contact an administrator if you need access.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
          <Button variant="ghost" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
