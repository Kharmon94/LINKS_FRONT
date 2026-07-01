import { Link, useLocation } from 'react-router';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  getAdminMobileTabItems,
  getAdminOverflowItems,
} from '@/app/config/admin-nav-items';
import { NavMoreSheet } from './nav-more-sheet';

export function AdminBottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const tabItems = getAdminMobileTabItems();
  const overflowItems = getAdminOverflowItems();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const moreActive = overflowItems.some((item) => isActive(item.path));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[100] bg-black text-white border-t border-white/10">
        <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-2 min-w-0"
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/50'}`} />
                <span
                  className={`text-[10px] uppercase tracking-wide truncate max-w-full px-1 ${
                    active ? 'text-white underline underline-offset-4' : 'text-white/50'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 min-w-0"
          >
            <MoreHorizontal className={`w-5 h-5 ${moreActive ? 'text-white' : 'text-white/50'}`} />
            <span
              className={`text-[10px] uppercase tracking-wide ${
                moreActive ? 'text-white underline underline-offset-4' : 'text-white/50'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      <NavMoreSheet open={moreOpen} onOpenChange={setMoreOpen} items={overflowItems} />
    </>
  );
}
