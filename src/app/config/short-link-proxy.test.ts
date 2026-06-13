import { describe, expect, it } from 'vitest';
import {
  isShortLinkSlug,
  parseShortCodeFromPath,
  RESERVED_SHORT_LINK_SLUGS,
} from '../../../short-link-proxy.mjs';
import reservedSlugsJson from './reserved-slugs.json';

describe('short-link-proxy matching', () => {
  it('shares reserved slugs with reserved-slugs.json', () => {
    expect([...RESERVED_SHORT_LINK_SLUGS]).toEqual(reservedSlugsJson);
  });

  it('parses valid short codes from paths', () => {
    expect(parseShortCodeFromPath('/abc123')).toBe('abc123');
    expect(parseShortCodeFromPath('/r0bodn')).toBe('r0bodn');
  });

  it('skips reserved SPA slugs', () => {
    expect(parseShortCodeFromPath('/analytics')).toBeNull();
    expect(parseShortCodeFromPath('/dashboard')).toBeNull();
    expect(isShortLinkSlug('analytics')).toBe(false);
  });

  it('rejects invalid path shapes', () => {
    expect(parseShortCodeFromPath('/ab')).toBeNull();
    expect(parseShortCodeFromPath('/links/abc123')).toBeNull();
    expect(parseShortCodeFromPath('/use-cases')).toBeNull();
  });
});
