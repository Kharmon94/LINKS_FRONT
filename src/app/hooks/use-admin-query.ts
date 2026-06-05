import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

type AdminQueryDefaults = {
  q?: string;
  role?: string;
  page?: string;
  user_id?: string;
};

export function useAdminQuery(defaults: AdminQueryDefaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? defaults.q ?? '';
  const role = searchParams.get('role') ?? defaults.role ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? defaults.page ?? '1', 10) || 1);
  const userId = searchParams.get('user_id') ?? defaults.user_id ?? '';

  const setQuery = useCallback(
    (updates: Partial<{ q: string; role: string; page: number; user_id: string }>, replace = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === '' || value === null) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          if ('q' in updates || 'role' in updates || 'user_id' in updates) {
            next.delete('page');
          }
          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const apiParams = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (userId) params.set('user_id', userId);
    params.set('page', String(page));
    return params;
  }, [q, role, page, userId]);

  return { q, role, page, userId, setQuery, apiParams };
}
