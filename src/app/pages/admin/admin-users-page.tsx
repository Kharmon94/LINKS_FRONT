import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Copy, MoreHorizontal, Users } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminUsers } from '@/services/admin-api';
import type { AdminUser, PaginationMeta } from '@/types';
import { adminLinksForUserPath, adminUserPath } from '@/lib/resource-paths';
import { useAdminQuery } from '@/app/hooks/use-admin-query';
import { AdminSearchInput } from '../../components/admin/admin-search-input';
import { AdminPagination } from '../../components/admin/admin-pagination';
import { AdminTierBadge } from '../../components/admin/admin-tier-badge';
import { AdminRoleBadge } from '../../components/admin/admin-role-badge';
import { AdminTableSkeleton, AdminEmptyState, AdminErrorState } from '../../components/admin/admin-page-states';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';

export function AdminUsersPage() {
  const { q, page, setQuery, apiParams } = useAdminQuery();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, perPage: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers(apiParams);
      setUsers(data.users);
      setMeta(data.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const copyEmail = (email: string) => {
    void navigator.clipboard.writeText(email);
    toast.success('Email copied');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Users</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">{meta.total} total users</p>
        </div>
        <AdminSearchInput value={q} onChange={(v) => setQuery({ q: v })} placeholder="Search email or name…" />
      </div>

      {error && <AdminErrorState message={error} onRetry={load} />}

      {loading ? (
        <AdminTableSkeleton />
      ) : users.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No users found"
          description={q ? 'Try a different search term.' : 'No users in the system yet.'}
        />
      ) : (
        <>
          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <Link to={adminUserPath(u)} className="font-medium hover:underline">{u.email}</Link>
                          <p className="text-xs text-muted-foreground">{u.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><AdminTierBadge tier={u.subscriptionTier} /></TableCell>
                    <TableCell><AdminRoleBadge role={u.role} /></TableCell>
                    <TableCell>
                      {u.admin ? <Badge variant="secondary">Platform admin</Badge> : '—'}
                    </TableCell>
                    <TableCell>{u.linksCount ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={adminUserPath(u)}>View detail</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={adminLinksForUserPath(u)}>View links</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyEmail(u.email)}>
                            <Copy className="w-4 h-4 mr-2" />Copy email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination meta={meta} onPageChange={(p) => setQuery({ page: p })} />
        </>
      )}
    </div>
  );
}
