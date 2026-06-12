import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Info, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminTeams, updateAdminUser } from '@/services/admin-api';
import type { AdminUser, PaginationMeta, UserRole } from '@/types';
import { useAdminQuery } from '@/app/hooks/use-admin-query';
import { AdminSearchInput } from '../../components/admin/admin-search-input';
import { AdminPagination } from '../../components/admin/admin-pagination';
import { AdminStatCard } from '../../components/admin/admin-stat-card';
import { AdminRoleBadge, getRoleBadgeColor } from '../../components/admin/admin-role-badge';
import { AdminTierBadge } from '../../components/admin/admin-tier-badge';
import { AdminConfirmDialog } from '../../components/admin/admin-confirm-dialog';
import { AdminTableSkeleton, AdminEmptyState, AdminErrorState } from '../../components/admin/admin-page-states';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';

const ROLES: (UserRole | '')[] = ['', 'owner', 'admin', 'member'];

export function AdminTeamsPage() {
  const { q, role, page, setQuery, apiParams } = useAdminQuery();
  const [members, setMembers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Record<UserRole, number>>({ owner: 0, admin: 0, member: 0 });
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, perPage: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmRole, setConfirmRole] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; role: UserRole; email: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTeams(apiParams);
      setMembers(data.members);
      setStats(data.stats);
      setMeta(data.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeRole = async (userId: string, newRole: UserRole) => {
    setSaving(true);
    try {
      await updateAdminUser(userId, { role: newRole });
      setMembers((m) => m.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success('Role updated');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
      setConfirmRole(false);
      setPendingRoleChange(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Teams</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-semibold">Teams</h1>
        <p className="text-muted-foreground text-sm">Account-level role oversight</p>
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-4 flex gap-3 text-sm text-muted-foreground">
        <Info className="w-5 h-5 flex-shrink-0" />
        <p>Team entities are not yet in the database. This view shows user roles across accounts. When Team models ship, this page will include team groupings above this list.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard label="Owners" value={stats.owner} icon={UsersRound} />
        <AdminStatCard label="Admins" value={stats.admin} icon={UsersRound} />
        <AdminStatCard label="Members" value={stats.member} icon={UsersRound} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <Button
              key={r || 'all'}
              variant={role === r ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuery({ role: r })}
            >
              {r || 'All'}
            </Button>
          ))}
        </div>
        <AdminSearchInput value={q} onChange={(v) => setQuery({ q: v })} placeholder="Search members…" />
      </div>

      {error && <AdminErrorState message={error} onRetry={load} />}

      {loading ? (
        <AdminTableSkeleton />
      ) : members.length === 0 ? (
        <AdminEmptyState icon={UsersRound} title="No members found" description="Adjust filters or search." />
      ) : (
        <>
          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Change role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link to={`/admin/users/${m.id}`} className="hover:underline">{m.email}</Link>
                      <p className="text-xs text-muted-foreground">{m.name}</p>
                    </TableCell>
                    <TableCell><AdminTierBadge tier={m.subscriptionTier} /></TableCell>
                    <TableCell><AdminRoleBadge role={m.role} /></TableCell>
                    <TableCell>{m.linksCount ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={m.role}
                        onValueChange={(v) => {
                          setPendingRoleChange({ userId: m.id, role: v as UserRole, email: m.email });
                          setConfirmRole(true);
                        }}
                      >
                        <SelectTrigger className={`w-28 ${getRoleBadgeColor(m.role)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination meta={meta} onPageChange={(p) => setQuery({ page: p })} />
        </>
      )}

      <AdminConfirmDialog
        open={confirmRole}
        onOpenChange={(open) => {
          setConfirmRole(open);
          if (!open) setPendingRoleChange(null);
        }}
        title="Change team role?"
        description={
          pendingRoleChange
            ? `Set team role to "${pendingRoleChange.role}" for ${pendingRoleChange.email}?`
            : ''
        }
        confirmLabel="Update role"
        loading={saving}
        onConfirm={() =>
          pendingRoleChange && changeRole(pendingRoleChange.userId, pendingRoleChange.role)
        }
      />
    </div>
  );
}
