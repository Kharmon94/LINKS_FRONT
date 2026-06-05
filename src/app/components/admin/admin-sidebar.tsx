import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  Activity,
  Flag,
  UsersRound,
  CreditCard,
  ArrowLeft,
  X,
  Shield,
} from 'lucide-react';

const navItems = [
  { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/links', label: 'Links', icon: LinkIcon },
  { path: '/admin/health', label: 'Health', icon: Activity },
  { path: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
  { path: '/admin/teams', label: 'Teams', icon: UsersRound },
  { path: '/admin/billing', label: 'Billing', icon: CreditCard },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
      active
        ? 'bg-black dark:bg-white text-white dark:text-black'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <div className="px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold">Admin</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={linkClass(isActive)}
            >
              <Icon className="w-5 h-5" />
              <span className="font-light">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/30">
        <Link
          to="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-light">Back to app</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose} />
          <aside className="fixed top-0 left-0 bottom-0 w-[280px] bg-card backdrop-blur-md shadow-lg z-[60] lg:hidden flex flex-col">
            <div className="flex items-center justify-end p-4 border-b border-border/30">
              <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavContent onItemClick={onClose} />
          </aside>
        </>
      )}

      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:top-[73px] lg:left-0 lg:bottom-0 lg:w-64 bg-card/50 backdrop-blur-md border-r border-border/30 z-10">
        <NavContent />
      </aside>
    </>
  );
}
