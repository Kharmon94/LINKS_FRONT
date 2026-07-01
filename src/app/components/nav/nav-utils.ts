export function isNavPathActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export const topNavLinkClass =
  'text-xs uppercase tracking-wide transition-colors hover:text-foreground';

export const topNavLinkActiveClass = 'text-foreground font-medium';
export const topNavLinkInactiveClass = 'text-muted-foreground';
