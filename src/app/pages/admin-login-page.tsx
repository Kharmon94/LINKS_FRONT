import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { AuthPage } from './auth-page';

export function AdminLoginPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const r = searchParams.get('returnTo');
    if (!r) return;
    // Reuse existing post_auth_redirect behavior used by VerifyPage.
    try {
      sessionStorage.setItem('post_auth_redirect', decodeURIComponent(r));
    } catch {
      sessionStorage.setItem('post_auth_redirect', r);
    }
  }, [searchParams]);

  return <AuthPage />;
}

