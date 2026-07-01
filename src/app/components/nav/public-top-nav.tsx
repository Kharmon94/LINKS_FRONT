import { Link } from 'react-router';
import { LANDING_PUBLIC_NAV_LINKS } from '@/app/config/public-nav-items';
import { PublicNavLogo } from './nav-logo';
import { NavThemeToggle } from './nav-theme-toggle';

type PublicNavItem = { label: string; href: string };

type PublicTopNavProps = {
  showLogin?: boolean;
  navItems?: PublicNavItem[];
};

export function PublicMobileHeader() {
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-center h-16 px-4">
        <PublicNavLogo className="h-10 w-auto" />
      </div>
    </header>
  );
}

export function PublicTopNav({
  showLogin = true,
  navItems = LANDING_PUBLIC_NAV_LINKS,
}: PublicTopNavProps) {
  return (
    <>
      <PublicMobileHeader />
      <header className="hidden lg:block fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[73px] px-4 sm:px-6 lg:px-8 gap-4">
          <nav className="flex items-center gap-5 justify-start">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="justify-self-center">
            <PublicNavLogo />
          </div>

          <div className="flex items-center gap-3 justify-end">
            {showLogin && (
              <Link
                to="/auth"
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full text-xs uppercase tracking-wide font-medium transition-colors"
              >
                Login
              </Link>
            )}
            <NavThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
