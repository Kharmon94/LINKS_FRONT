import { describe, it, expect } from 'vitest';
import { isJwtExpired, parseJwtPayload } from './jwt';

function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.sig`;
}

describe('jwt', () => {
  it('parses payload segment', () => {
    const token = makeToken({ sub: '42', exp: 9999999999 });
    expect(parseJwtPayload(token)?.sub).toBe('42');
  });

  it('detects expired tokens', () => {
    const token = makeToken({ exp: 1 });
    expect(isJwtExpired(token)).toBe(true);
  });

  it('accepts valid future tokens', () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isJwtExpired(token)).toBe(false);
  });

  it('parses unpadded base64url payloads', () => {
    const token = makeToken({ sub: '7', exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(parseJwtPayload(token)?.sub).toBe('7');
    expect(isJwtExpired(token)).toBe(false);
  });

  it('does not treat missing exp as expired', () => {
    const token = makeToken({ sub: '42' });
    expect(isJwtExpired(token)).toBe(false);
  });
});
