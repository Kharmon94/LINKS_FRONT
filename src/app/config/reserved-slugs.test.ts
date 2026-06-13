import { describe, expect, it } from 'vitest';
import { isReservedShortLinkSlug, isShortLinkSlug } from '@/app/config/reserved-slugs';

describe('reserved short link slugs', () => {
  it('does not treat app routes as short links', () => {
    expect(isShortLinkSlug('analytics')).toBe(false);
    expect(isShortLinkSlug('dashboard')).toBe(false);
    expect(isShortLinkSlug('campaigns')).toBe(false);
    expect(isShortLinkSlug('settings')).toBe(false);
  });

  it('still treats real short codes as short links', () => {
    expect(isShortLinkSlug('abc123')).toBe(true);
    expect(isShortLinkSlug('spring24')).toBe(true);
  });

  it('rejects invalid shapes', () => {
    expect(isShortLinkSlug('ab')).toBe(false);
    expect(isShortLinkSlug('use-cases')).toBe(false);
    expect(isReservedShortLinkSlug('analytics')).toBe(true);
  });
});
