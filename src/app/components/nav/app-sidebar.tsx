import { Link, useLocation, useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  getDesktopSidebarFooterItems,
  getDesktopSidebarNavItems,
} from '@/app/config/app-nav-items';
import { WorkspaceSwitcher } from '../workspace-switcher';
import { isNavPathActive } from './nav-utils';

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { permissions, platformAdmin } = usePermissions();

  const ctx = { permissions, platformAdmin };
  const primaryItems = getDesktopSidebarNavItems(ctx);
  const footerItems = getDesktopSidebarFooterItems(ctx);

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

  return (
    <>
      <aside
        className={`hidden lg:block fixed top-[73px] left-0 bottom-0 bg-card/50 backdrop-blur-md shadow-sm z-10 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <nav className={`flex-1 space-y-1 ${collapsed ? 'p-2' : 'p-4'}`}>
            {primaryItems.map((item) => {
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

            {!collapsed && (
              <div className="pt-2">
                <WorkspaceSwitcher />
              </div>
            )}
          </nav>

          <div className={`space-y-1 ${collapsed ? 'p-2' : 'p-4'}`}>
            {footerItems.map((item) => {
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

            <button
              type="button"
              onClick={toggleTheme}
              className={actionButtonClass}
              title={collapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
            >
              {isDark ? (
                <>
                  <Sun className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">Light Mode</span>}
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">Dark Mode</span>}
                </>
              )}
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
        className={`hidden lg:flex fixed top-[75px] z-50 items-center justify-center w-8 h-8 bg-card hover:bg-muted rounded-full shadow-lg transition-all duration-300 ${
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
