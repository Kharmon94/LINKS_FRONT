import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';

const SHORT_CODE_PATTERN = /^[a-z0-9]{4,32}$/;

/** Resolve where short-link GET requests must be handled (Rails RedirectsController). */
export function resolveShortLinkRedirectUrl(shortCode: string, search: string): string {
  const apiBase =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
    (import.meta.env.DEV ? 'http://localhost:3000' : '');
  if (apiBase) {
    return `${apiBase}/${shortCode}${search}`;
  }
  return `/${shortCode}${search}`;
}

export function ShortLinkRedirectPage() {
  const { shortCode = '' } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!SHORT_CODE_PATTERN.test(shortCode)) return;
    const search = searchParams.toString();
    const query = search ? `?${search}` : '';
    window.location.replace(resolveShortLinkRedirectUrl(shortCode, query));
  }, [shortCode, searchParams]);

  if (!SHORT_CODE_PATTERN.test(shortCode)) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p className="text-muted-foreground text-sm">Redirecting…</p>
    </div>
  );
}
