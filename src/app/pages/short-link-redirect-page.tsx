import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { isShortLinkSlug } from '@/app/config/reserved-slugs';

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
    if (!isShortLinkSlug(shortCode)) return;
    const search = searchParams.toString();
    const query = search ? `?${search}` : '';
    window.location.replace(resolveShortLinkRedirectUrl(shortCode, query));
  }, [shortCode, searchParams]);

  if (!isShortLinkSlug(shortCode)) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p className="text-muted-foreground text-sm">Redirecting…</p>
    </div>
  );
}
