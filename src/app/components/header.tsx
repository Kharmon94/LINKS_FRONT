import { Moon, Sun, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
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
  LogOut
} from 'lucide-react';
import logoWhite from '@/assets/13a610c2eb52d37dcdb23da9c6c27891d7b11cf3.png';
import logoBlack from '@/assets/45d2c3ca8dcadef95132a6169f23902806153f9c.png';

interface HeaderProps {
  onMenuToggle?: () => void;
  customNavItems?: Array<{ label: string; href: string }>;
}

export function Header({ onMenuToggle, customNavItems }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { permissions } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { path: '/links', label: 'Links', icon: LinkIcon, show: true },
    { path: '/campaigns', label: 'Campaigns', icon: FolderKanban, show: true },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, show: permissions.analytics.read },
    { path: '/team', label: 'Team', icon: Users, show: true },
    { path: '/workspaces', label: 'Workspaces', icon: Briefcase, show: true },
    { path: '/settings', label: 'Settings', icon: Settings, show: true },
  ].filter((item) => item.show);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Default nav items if not provided
  const defaultNavItems = [
    { label: 'Features', href: '#' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '#' },
  ];

  const publicNavItems = customNavItems || defaultNavItems;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${ 
      isScrolled 
        ? 'bg-background shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-center relative">
          <Link to="/" className="flex items-center">
            <img 
              src={isDark ? logoWhite : logoBlack} 
              alt="Blackcollar.io" 
              className="h-14 w-auto"
            />
          </Link>
          <button
            onClick={toggleMenu}
            className="absolute right-0 p-2 rounded-sm hover:bg-accent/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <Link to="/">
            <img 
              src={isDark ? logoWhite : logoBlack} 
              alt="Blackcollar.io" 
              className={isDark ? "h-14 w-auto" : "h-12 w-auto"}
            />
          </Link>
          
          {/* Show custom nav items if provided, otherwise show default nav items for non-authenticated users */}
          {(customNavItems || !isAuthenticated) && (
            <>
              <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
                {publicNavItems.map((item) => (
                  <a key={item.label} href={item.href} className="text-sm hover:text-foreground transition-colors text-muted-foreground">
                    {item.label}
                  </a>
                ))}
              </nav>
              
              <div className="flex items-center gap-4">
                {customNavItems && (
                  <Link 
                    to="/auth" 
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                )}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-sm hover:bg-accent/50 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="w-6 h-6" />
                  ) : (
                    <Moon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <nav className="px-4 py-4">
            {customNavItems ? (
              // Custom nav items (for landing page and other frontend pages)
              <div className="space-y-2">
                {publicNavItems.map((item) => (
                  <a 
                    key={item.label} 
                    href={item.href} 
                    className="block px-4 py-3 text-sm rounded-full hover:bg-muted hover:text-foreground transition-colors text-muted-foreground"
                  >
                    {item.label}
                  </a>
                ))}
                <Link 
                  to="/auth" 
                  className="block text-center px-4 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full transition-colors text-sm font-medium mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm hover:bg-muted hover:text-foreground transition-colors text-muted-foreground mt-2"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            ) : isAuthenticated ? (
              // Authenticated mobile menu
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                  location.pathname.startsWith(item.path + '/');
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-full
                        transition-colors text-left
                        ${isActive 
                          ? 'bg-black dark:bg-white text-white dark:text-black' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-light">{item.label}</span>
                    </button>
                  );
                })}
                
                {/* Workspace Switcher below Settings */}
                <div className="pt-2">
                  <WorkspaceSwitcher />
                </div>
                
                {/* Theme toggle in mobile dropdown for authenticated users */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left mt-2 pt-4"
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              // Non-authenticated mobile menu
              <div className="space-y-2">
                {publicNavItems.map((item) => (
                  <a 
                    key={item.label} 
                    href={item.href} 
                    className="block px-4 py-3 text-sm rounded-full hover:bg-muted hover:text-foreground transition-colors text-muted-foreground"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm hover:bg-muted hover:text-foreground transition-colors text-muted-foreground mt-2"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}