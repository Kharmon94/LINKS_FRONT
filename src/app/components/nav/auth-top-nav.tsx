import { Link, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { PublicNavLogo } from './nav-logo';

type AuthTopNavProps = {
  backTo?: string;
  backLabel?: string;
};

export function AuthTopNav({ backTo = '/', backLabel = 'Back' }: AuthTopNavProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </button>
        <PublicNavLogo className="h-9 w-auto" />
        <div className="w-16" aria-hidden />
      </div>
    </header>
  );
}
