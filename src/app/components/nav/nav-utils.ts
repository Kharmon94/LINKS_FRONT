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

/** Fixed mobile bottom tab bar content height (~56px). */
export const MOBILE_BOTTOM_NAV_HEIGHT = '3.5rem';

/** Extra gap below tab labels so the iOS home indicator sits beneath the options. */
export const MOBILE_BOTTOM_NAV_SAFE_PADDING = '0.5rem';

/** Inner row for mobile bottom tab bars — tab options sit above the home indicator. */
export const MOBILE_BOTTOM_NAV_INNER_CLASS = `flex items-stretch justify-around px-1 pb-[calc(${MOBILE_BOTTOM_NAV_SAFE_PADDING}+env(safe-area-inset-bottom,0px))]`;

/** Apply to layout `<main>` so scrollable content clears the fixed bottom nav on mobile. */
export const MOBILE_BOTTOM_NAV_CLEARANCE_CLASS = `pb-[calc(${MOBILE_BOTTOM_NAV_HEIGHT}+${MOBILE_BOTTOM_NAV_SAFE_PADDING}+env(safe-area-inset-bottom,0px)+1rem)] lg:pb-0`;

export const MOBILE_BOTTOM_NAV_Z_CLASS = 'z-[100]';

export const NAV_MORE_SHEET_Z_CLASS = 'z-[110]';

/** Workspace picker must render above the More sheet on mobile. */
export const WORKSPACE_PICKER_Z_CLASS = 'z-[120]';

export const topNavLinkClass =
  'text-xs uppercase tracking-wide transition-colors hover:text-foreground';

export const topNavLinkActiveClass = 'text-foreground font-medium';
export const topNavLinkInactiveClass = 'text-muted-foreground';
