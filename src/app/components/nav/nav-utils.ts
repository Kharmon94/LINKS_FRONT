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

/** Auth / verify pages — keep actions above iOS home indicator and browser chrome. */
export const AUTH_PAGE_MAIN_CLASS =
  'flex-1 w-full overflow-y-auto px-4 pt-20 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]';

export const AUTH_PAGE_CONTENT_CLASS =
  'mx-auto w-full max-w-md py-8 sm:py-12';

/** Fixed mobile bottom tab bar content height (~56px). */
export const MOBILE_BOTTOM_NAV_HEIGHT = '3.5rem';

/** Extra gap below tab labels so the iOS home indicator sits beneath the options. */
export const MOBILE_BOTTOM_NAV_SAFE_PADDING = '1.5rem';

/**
 * Inner row for mobile bottom tab bars — tab options sit above the home indicator.
 * Class strings must be static (no template interpolation) so Tailwind emits them.
 */
export const MOBILE_BOTTOM_NAV_INNER_CLASS =
  'flex items-stretch justify-around px-1 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]';

/** Apply to layout `<main>` so scrollable content clears the fixed bottom nav on mobile. */
export const MOBILE_BOTTOM_NAV_CLEARANCE_CLASS =
  'pb-[calc(3.5rem+1.5rem+env(safe-area-inset-bottom,0px)+0.5rem)] lg:pb-0';

export const MOBILE_BOTTOM_NAV_Z_CLASS = 'z-[100]';

export const NAV_MORE_SHEET_Z_CLASS = 'z-[110]';

/** Desktop top-nav overflow dropdown — above the fixed header (z-[100]), below modals. */
export const TOP_NAV_DROPDOWN_Z_CLASS = 'z-[110]';

export const topNavDropdownContentProps = {
  side: 'bottom' as const,
  align: 'start' as const,
  sideOffset: 8,
  collisionPadding: 16,
  avoidCollisions: false,
  className: `${TOP_NAV_DROPDOWN_Z_CLASS} border-border/50`,
};

/** Workspace picker must render above the More sheet on mobile. */
export const WORKSPACE_PICKER_Z_CLASS = 'z-[120]';

export const topNavLinkClass =
  'text-xs uppercase tracking-wide transition-colors hover:text-foreground';

export const topNavLinkActiveClass = 'text-foreground font-medium';
export const topNavLinkInactiveClass = 'text-muted-foreground';
