import { Link, useLocation, useNavigate } from 'react-router';
import { LogOut, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { themeModeIcon, themeModeLabel } from '@/lib/theme-mode-utils';
import { usePermissions } from '@/hooks/use-permissions';
import {
  getMobileMoreNavItems,
  getMobileTabNavItems,
} from '@/app/config/app-nav-items';
import { WorkspaceSwitcher } from '../workspace-switcher';
import { NavMoreSheet, type NavMoreSheetItem } from './nav-more-sheet';
import {
  getBottomNavMoreActive,
  getBottomNavTabActive,
  mobileBottomNavIconClass,
  mobileBottomNavLabelClass,
  MOBILE_BOTTOM_NAV_INNER_CLASS,
  MOBILE_BOTTOM_NAV_SHELL_CLASS,
  MOBILE_BOTTOM_NAV_Z_CLASS,
} from './nav-utils';

export function AppBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const { permissions, platformAdmin } = usePermissions();
  const [moreOpen, setMoreOpen] = useState(false);

  const ctx = { permissions, platformAdmin };
  const tabItems = getMobileTabNavItems(ctx);
  const moreLinkItems = getMobileMoreNavItems(ctx);
  const morePaths = moreLinkItems.map((item) => item.path);
  const moreActive = getBottomNavMoreActive(location.pathname, morePaths, moreOpen);

  const moreSheetItems = useMemo<NavMoreSheetItem[]>(
    () => [
      ...moreLinkItems.map((item) => ({
        kind: 'link' as const,
        path: item.path,
        label: item.label,
        icon: item.icon,
      })),
      {
        kind: 'action',
        id: 'theme',
        label: `Theme: ${themeModeLabel(theme)}`,
        icon: themeModeIcon(theme),
        onClick: cycleTheme,
      },
      {
        kind: 'action',
        id: 'logout',
        label: 'Logout',
        icon: LogOut,
        onClick: () => {
          void logout().then(() => navigate('/'));
        },
      },
    ],
    [cycleTheme, logout, moreLinkItems, navigate, theme],
  );

  return (
    <>
      <nav
        aria-hidden={moreOpen}
        className={`lg:hidden fixed bottom-0 inset-x-0 ${MOBILE_BOTTOM_NAV_Z_CLASS} ${MOBILE_BOTTOM_NAV_SHELL_CLASS} transition-opacity ${
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
                <Icon className={mobileBottomNavIconClass(active)} />
                <span className={mobileBottomNavLabelClass(active)}>
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
            <MoreHorizontal className={mobileBottomNavIconClass(moreActive)} />
            <span className={mobileBottomNavLabelClass(moreActive, false)}>
              More
            </span>
          </button>
        </div>
      </nav>

      <NavMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        header={
          <div className="px-2">
            <WorkspaceSwitcher />
          </div>
        }
        items={moreSheetItems}
      />
    </>
  );
}
