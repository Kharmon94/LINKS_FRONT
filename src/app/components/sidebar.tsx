import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { useTheme } from '../contexts/theme-context';
import { WorkspaceSwitcher } from './workspace-switcher';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  FolderKanban, 
  BarChart3, 
  Users, 
  Briefcase,
  Settings,
  X,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  isDesktopCollapsed?: boolean;
  onDesktopToggle?: () => void;
}

export function Sidebar({ id, isOpen, onClose, isDesktopCollapsed, onDesktopToggle }: SidebarProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSignOut = () => {
    // TODO: Replace with actual sign out logic (clear auth tokens, etc.)
    window.location.href = '/';
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/links', label: 'Links', icon: LinkIcon },
    { path: '/campaigns', label: 'Campaigns', icon: FolderKanban },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/workspaces', label: 'Workspaces', icon: Briefcase },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />
          
          {/* Mobile Sidebar */}
          <aside className="fixed top-0 left-0 bottom-0 w-[280px] bg-card backdrop-blur-md shadow-lg z-[60] lg:hidden">
            <div className="flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                  location.pathname.startsWith(item.path + '/');
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-full
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-black dark:bg-white text-white dark:text-black' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-light">{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Workspace Switcher */}
                <div className="pt-2">
                  <WorkspaceSwitcher />
                </div>
              </nav>

              {/* Theme Toggle & User Info */}
              <div className="p-4 space-y-3 border-t border-border/30">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span className="font-medium">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span className="font-medium">Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>

                {/* Plan Info */}
                <div className="px-4 py-3 bg-muted/50 rounded-sm">
                  <p className="text-sm font-medium">Free Plan</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3/100 links used
                  </p>
                  <Link 
                    to="/settings"
                    onClick={onClose}
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Sidebar - Desktop Only, Hidden on Mobile */}
      <aside id={id} className={`hidden lg:block fixed top-[89px] left-0 bottom-0 bg-card/50 backdrop-blur-md shadow-sm z-10 transition-all duration-300 ${isDesktopCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Navigation */}
          <nav className={`flex-1 space-y-1 ${isDesktopCollapsed ? 'p-2' : 'p-4'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              location.pathname.startsWith(item.path + '/');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center rounded-full
                    transition-colors duration-200
                    ${isDesktopCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
                    ${isActive 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  title={isDesktopCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isDesktopCollapsed && <span className="font-light">{item.label}</span>}
                </Link>
              );
            })}
            
            {/* Workspace Switcher below Settings */}
            {!isDesktopCollapsed && (
              <div className="pt-2">
                <WorkspaceSwitcher />
              </div>
            )}
          </nav>

          {/* Theme Toggle & User Info */}
          <div className={`space-y-3 bg-[#f6f6f600] ${isDesktopCollapsed ? 'p-2' : 'p-4'}`}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isDesktopCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
              title={isDesktopCollapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
            >
              {isDark ? (
                <>
                  <Sun className="w-5 h-5 flex-shrink-0" />
                  {!isDesktopCollapsed && <span className="font-medium">Light Mode</span>}
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 flex-shrink-0" />
                  {!isDesktopCollapsed && <span className="font-medium">Dark Mode</span>}
                </>
              )}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isDesktopCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
              title={isDesktopCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isDesktopCollapsed && <span className="font-medium">Sign Out</span>}
            </button>

            {/* Plan Info */}
            {!isDesktopCollapsed && (
              <div className="px-4 py-3 bg-muted/50 rounded-sm">
                <p className="text-sm font-medium">Free Plan</p>
                <p className="text-xs text-muted-foreground mt-1">
                  3/100 links used
                </p>
                <Link 
                  to="/settings"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Toggle Button - Desktop Only */}
      <button
        type="button"
        onClick={onDesktopToggle}
        className={`hidden lg:flex fixed top-[75px] z-50 items-center justify-center w-8 h-8 bg-card hover:bg-muted rounded-full shadow-lg transition-all duration-300 ${isDesktopCollapsed ? 'left-[52px]' : 'left-[248px]'}`}
        title={isDesktopCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        {isDesktopCollapsed ? (
          <ChevronRight className="w-5 h-5 text-foreground" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-foreground" />
        )}
      </button>
    </>
  );
}