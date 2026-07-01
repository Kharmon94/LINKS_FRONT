import { Link, useLocation, useNavigate } from 'react-router';
import { LogOut, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  getPrimaryNavItems,
  getOverflowNavItems,
  type AppNavItem,
} from '@/app/config/app-nav-items';
import { NavLogo } from './nav-logo';
import { NavThemeToggle } from './nav-theme-toggle';
import { topNavDropdownContentProps, topNavLinkClass, topNavLinkInactiveClass } from './nav-utils';
import { WorkspaceSwitcher } from '../workspace-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

function TopNavLink({ item, active }: { item: AppNavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`inline-flex items-center gap-2 text-xs uppercase tracking-wide transition-colors ${
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="w-4 h-4 hidden lg:inline" />
      {item.label}
    </Link>
  );
}

export function AppTopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { permissions, platformAdmin } = usePermissions();

  const ctx = { permissions, platformAdmin };
  const primaryItems = getPrimaryNavItems(ctx);
  const overflowItems = getOverflowNavItems(ctx);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="hidden lg:block fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[73px] px-4 sm:px-6 lg:px-8 gap-4">
          <nav className="flex items-center gap-5 justify-start min-w-0">
            {primaryItems.map((item) => (
              <TopNavLink key={item.path} item={item} active={isActive(item.path)} />
            ))}
            {overflowItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center gap-2 ${topNavLinkClass} ${topNavLinkInactiveClass}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  More
                </DropdownMenuTrigger>
                <DropdownMenuContent {...topNavDropdownContentProps}>
                  {overflowItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="justify-self-center">
            <NavLogo />
          </div>

          <div className="flex items-center gap-3 justify-end min-w-0">
            <WorkspaceSwitcher variant="compact" />
            <NavThemeToggle />
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <header className="lg:hidden fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-center h-16 px-4">
          <NavLogo className="h-10 w-auto" />
        </div>
      </header>
    </>
  );
}
