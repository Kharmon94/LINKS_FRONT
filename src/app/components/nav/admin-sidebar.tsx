import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, ChevronLeft, ChevronRight, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { themeModeIcon, themeModeLabel } from '@/lib/theme-mode-utils';
import { getAdminDesktopSidebarItems } from '@/app/config/admin-nav-items';
import { isNavPathActive } from './nav-utils';

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, cycleTheme, mounted } = useTheme();
  const items = getAdminDesktopSidebarItems();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClass = (path: string) => {
    const active = isNavPathActive(location.pathname, path);
    return `flex items-center rounded-full transition-colors duration-200 ${
      collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
    } ${
      active
        ? 'bg-black dark:bg-white text-white dark:text-black'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;
  };

  const actionButtonClass = `w-full flex items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
    collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
  }`;

  const ThemeIcon = mounted ? themeModeIcon(theme) : themeModeIcon('system');
  const themeLabel = themeModeLabel(theme);

  return (
    <>
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 bg-card/50 backdrop-blur-md shadow-sm z-10 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div
            className={`flex shrink-0 items-center border-b border-border/30 ${
              collapsed ? 'justify-center p-3' : 'gap-2 px-4 py-4'
            }`}
          >
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            {!collapsed && <span className="text-sm font-semibold">Admin</span>}
          </div>

          <nav className={`flex-1 space-y-1 ${collapsed ? 'p-2' : 'p-4'}`}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={navLinkClass(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-light">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className={`space-y-1 ${collapsed ? 'p-2' : 'p-4'}`}>
            <Link
              to="/links"
              className={navLinkClass('/links')}
              title={collapsed ? 'Back to app' : undefined}
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-light">Back to app</span>}
            </Link>

            <button
              type="button"
              onClick={cycleTheme}
              className={actionButtonClass}
              title={collapsed ? themeLabel : undefined}
            >
              <ThemeIcon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{themeLabel}</span>}
            </button>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className={actionButtonClass}
              title={collapsed ? 'Sign out' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      <button
        type="button"
        onClick={onToggle}
        className={`hidden lg:flex fixed z-50 items-center justify-center w-8 h-8 bg-card hover:bg-muted rounded-full shadow-lg transition-all duration-300 top-[4.5rem] ${
          collapsed ? 'left-[52px]' : 'left-[248px]'
        }`}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-foreground" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-foreground" />
        )}
      </button>
    </>
  );
}
