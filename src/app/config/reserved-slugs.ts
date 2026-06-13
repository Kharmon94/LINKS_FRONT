/** Top-level SPA paths that match short-code shape `[a-z0-9]{4,32}` — never treat as short links. */
export const RESERVED_SHORT_LINK_SLUGS = [
  'admin',
  'analytics',
  'auth',
  'campaigns',
  'dashboard',
  'links',
  'pricing',
  'settings',
  'team',
  'workspaces',
] as const;

export const SHORT_CODE_PATTERN = /^[a-z0-9]{4,32}$/;

export function isReservedShortLinkSlug(slug: string): boolean {
  return (RESERVED_SHORT_LINK_SLUGS as readonly string[]).includes(slug);
}

export function isShortLinkSlug(slug: string): boolean {
  return SHORT_CODE_PATTERN.test(slug) && !isReservedShortLinkSlug(slug);
}
