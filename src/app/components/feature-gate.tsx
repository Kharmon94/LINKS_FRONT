import { Navigate } from 'react-router';
import { AppLayout } from '@/app/components/app-layout';
import { Lock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Link } from 'react-router';

export function FeatureGate({
  allowed,
  featureName,
  children,
}: {
  allowed: boolean;
  featureName: string;
  children: React.ReactNode;
}) {
  if (allowed) return <>{children}</>;

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold mb-2">{featureName} unavailable</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          This feature is not enabled for your account or plan. Contact support or upgrade to access it.
        </p>
        <Button asChild variant="outline">
          <Link to="/links">Back to links</Link>
        </Button>
      </div>
    </AppLayout>
  );
}

export function RequirePermission({
  allowed,
  children,
}: {
  allowed: boolean;
  children: React.ReactNode;
}) {
  if (!allowed) return <Navigate to="/links" replace />;
  return <>{children}</>;
}
