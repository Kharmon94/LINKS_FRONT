import { Link, useLocation } from 'react-router';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import {
  getMobileTabNavItems,
  getOverflowNavItems,
} from '@/app/config/app-nav-items';
import { WorkspaceSwitcher } from '../workspace-switcher';
import { NavMoreSheet } from './nav-more-sheet';
import {
  getBottomNavMoreActive,
  getBottomNavTabActive,
  MOBILE_BOTTOM_NAV_INNER_CLASS,
  MOBILE_BOTTOM_NAV_Z_CLASS,
} from './nav-utils';

export function AppBottomNav() {
  const location = useLocation();
  const { permissions, platformAdmin } = usePermissions();
  const [moreOpen, setMoreOpen] = useState(false);

  const ctx = { permissions, platformAdmin };
  const tabItems = getMobileTabNavItems(ctx);
  const overflowItems = getOverflowNavItems(ctx);

  const overflowPaths = overflowItems.map((item) => item.path);
  const moreActive = getBottomNavMoreActive(location.pathname, overflowPaths, moreOpen);

  return (
    <>
      <nav
        aria-hidden={moreOpen}
        className={`lg:hidden fixed bottom-0 inset-x-0 ${MOBILE_BOTTOM_NAV_Z_CLASS} bg-black text-white border-t border-white/10 transition-opacity ${
          moreOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div className={MOBILE_BOTTOM_NAV_INNER_CLASS}>
          {tabItems.map((item) => {
            const Icon = item.icon;
            const active = getBottomNavTabActive(location.pathname, item.path, moreOpen);
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
          {overflowItems.length > 0 && (
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
          )}
        </div>
      </nav>

      <NavMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        items={overflowItems}
        footer={<WorkspaceSwitcher />}
      />
    </>
  );
}
