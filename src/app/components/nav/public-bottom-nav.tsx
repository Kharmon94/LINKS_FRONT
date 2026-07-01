import { Link, useLocation } from 'react-router';
import { PUBLIC_MOBILE_TABS } from '@/app/config/public-nav-items';

export function PublicBottomNav() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-[100] bg-black text-white border-t border-white/10">
      <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {PUBLIC_MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 min-w-0"
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/50'}`} />
              <span
                className={`text-[10px] uppercase tracking-wide truncate max-w-full px-1 ${
                  active ? 'text-white underline underline-offset-4' : 'text-white/50'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
