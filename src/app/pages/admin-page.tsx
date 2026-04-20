import { useEffect, useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { apiRequest } from '@/services/api';
import type { User } from '@/types';

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ users: User[] }>('/api/v1/admin/users');
        if (!cancelled) setUsers(data.users);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Admin</h1>
        <p className="text-muted-foreground mb-6">Users</p>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto bg-card/50 backdrop-blur-md rounded-lg">
            <table className="w-full text-sm">
              <thead className="border-b border-border/30">
                <tr>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Tier</th>
                  <th className="text-left px-4 py-3">Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/20">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.subscriptionTier}</td>
                    <td className="px-4 py-3">{u.admin ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

