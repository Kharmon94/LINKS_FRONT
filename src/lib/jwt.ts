type JwtPayload = {
  sub?: string;
  exp?: number;
  iat?: number;
};

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** True when the token is missing, malformed, or past expiry (with optional skew). */
export function isJwtExpired(token: string, skewSeconds = 60): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}
