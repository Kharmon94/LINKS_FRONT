import { Link, useParams } from 'react-router';
import { isShortLinkSlug } from '@/app/config/reserved-slugs';

/** SPA fallback when dev/prod proxy did not intercept a short code (e.g. reserved slug collision). */
export function ShortLinkRedirectPage() {
  const { shortCode = '' } = useParams();

  if (!isShortLinkSlug(shortCode)) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold mb-2">Link not found</h1>
        <p className="text-muted-foreground text-sm mb-4">
          This short link does not exist or may have been removed.
        </p>
        <Link to="/" className="text-sm underline underline-offset-4">
          Go to Links.BlackCollar.io
        </Link>
      </div>
    </div>
  );
}
