type JwtPayload = {
  sub?: string;
  exp?: number;
  iat?: number;
};

function decodeBase64Url(segment: string): string {
  let normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  if (pad) normalized += '='.repeat(4 - pad);
  return atob(normalized);
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const json = decodeBase64Url(segment);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** True when the token payload has a definite expiry in the past (with optional skew). */
export function isJwtExpired(
  token: string,
  skewSeconds = 60,
  nowMs: number = Date.now(),
): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp <= Math.floor(nowMs / 1000) + skewSeconds;
}
