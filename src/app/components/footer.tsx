import { NavLogo } from './nav/nav-logo';
import { cn } from './ui/utils';

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('shadow-sm bg-background', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <NavLogo className="h-8 w-auto" />
          <p className="text-sm text-muted-foreground">© 2026 BlackCollar.io. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}