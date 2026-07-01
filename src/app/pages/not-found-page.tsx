import { Link, useLocation } from 'react-router';
import { PublicTopNav } from '../components/nav/public-top-nav';
import { PublicBottomNav } from '../components/nav/public-bottom-nav';

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicTopNav />
      <PublicBottomNav />
      <main className="flex-1 flex items-center justify-center p-6 pt-20 lg:pt-[73px] pb-20">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          Nothing is mounted at <span className="font-mono">{location.pathname}</span>.
        </p>
        <div className="flex gap-3">
          <Link className="underline underline-offset-4" to="/">
            Go home
          </Link>
          <Link className="underline underline-offset-4" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>
      </main>
    </div>
  );
}

