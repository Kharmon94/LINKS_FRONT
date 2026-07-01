export function isNavPathActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** When the More sheet is open, only the More tab should appear active. */
export function getBottomNavTabActive(
  pathname: string,
  path: string,
  moreOpen: boolean,
): boolean {
  if (moreOpen) return false;
  return isNavPathActive(pathname, path);
}

/** More tab is active when the sheet is open or the current route is in overflow. */
export function getBottomNavMoreActive(
  pathname: string,
  overflowPaths: string[],
  moreOpen: boolean,
): boolean {
  if (moreOpen) return true;
  return overflowPaths.some((path) => isNavPathActive(pathname, path));
}

/** Fixed mobile bottom tab bar height (~56px) plus safe-area inset. */
export const MOBILE_BOTTOM_NAV_HEIGHT = '3.5rem';

/** Apply to layout `<main>` so scrollable content clears the fixed bottom nav on mobile. */
export const MOBILE_BOTTOM_NAV_CLEARANCE_CLASS =
  'pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+1rem)] md:pb-0';

export const MOBILE_BOTTOM_NAV_Z_CLASS = 'z-[100]';

export const NAV_MORE_SHEET_Z_CLASS = 'z-[110]';

export const topNavLinkClass =
  'text-xs uppercase tracking-wide transition-colors hover:text-foreground';

export const topNavLinkActiveClass = 'text-foreground font-medium';
export const topNavLinkInactiveClass = 'text-muted-foreground';
