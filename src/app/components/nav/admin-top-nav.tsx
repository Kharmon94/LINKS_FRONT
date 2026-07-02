import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, MoreHorizontal, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import {
  getAdminDesktopOverflowItems,
  getAdminDesktopPrimaryItems,
} from '@/app/config/admin-nav-items';
import { NavThemeToggle } from './nav-theme-toggle';
import { topNavDropdownContentProps, topNavLinkClass, topNavLinkInactiveClass } from './nav-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function AdminTopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const primaryItems = getAdminDesktopPrimaryItems();
  const overflowItems = getAdminDesktopOverflowItems();

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
          <nav className="flex items-center gap-4 justify-start min-w-0 overflow-x-auto">
            {primaryItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${
                  isActive(item.path)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
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
                  {overflowItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="justify-self-center flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Admin</span>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Link
              to="/links"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to app
            </Link>
            <NavThemeToggle />
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <header className="lg:hidden fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-center h-16 px-4 gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold">Platform Admin</span>
        </div>
      </header>
    </>
  );
}
