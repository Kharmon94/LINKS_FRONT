import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Users, Link as LinkIcon, Shield, Flag, RefreshCw } from 'lucide-react';
import { fetchAdminDashboard, fetchFeatureFlags } from '@/services/admin-api';
import type { AdminDashboardStats, AdminUser, FeatureFlagJson } from '@/types';
import { AdminStatCard } from '../../components/admin/admin-stat-card';
import { AdminStatRowSkeleton, AdminErrorState } from '../../components/admin/admin-page-states';
import { Button } from '../../components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchAdminUsers } from '@/services/admin-api';
import { adminUserPath } from '@/lib/resource-paths';
import { AdminTierBadge } from '../../components/admin/admin-tier-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [flags, setFlags] = useState<FeatureFlagJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, usersRes, flagsRes] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminUsers(new URLSearchParams({ page: '1', per_page: '10' })),
        fetchFeatureFlags(),
      ]);
      setStats(dash.stats);
      setRecentUsers(usersRes.users);
      setFlags(flagsRes.featureFlags);
      setRefreshedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <AdminStatRowSkeleton />
        <AdminStatRowSkeleton count={2} />
      </div>
    );
  }

  if (error && !stats) {
    return <AdminErrorState message={error} onRetry={load} />;
  }

  if (!stats) return null;

  const tierData = Object.entries(stats.usersByTier).map(([tier, count]) => ({ tier, count }));
  const roleData = Object.entries(stats.usersByRole).map(([role, count]) => ({ role, count }));
  const enabledFlags = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-muted-foreground text-sm">Platform metrics and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          {refreshedAt && (
            <span className="text-xs text-muted-foreground">
              Updated {refreshedAt.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard label="Users" value={stats.usersCount} icon={Users} />
        <AdminStatCard label="Links" value={stats.linksCount} icon={LinkIcon} />
        <AdminStatCard label="Links (7d)" value={stats.linksCreatedLast7Days} icon={LinkIcon} hint="Last 7 days" />
        <AdminStatCard label="Platform admins" value={stats.adminUsersCount} icon={Shield} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-5">
          <h2 className="font-medium mb-4">Users by tier</h2>
          <ChartContainer config={{ count: { label: 'Users', color: 'var(--primary)' } }} className="h-[220px] w-full">
            <BarChart data={tierData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="tier" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-5">
          <h2 className="font-medium mb-4">Users by role</h2>
          <ChartContainer config={{ count: { label: 'Users', color: 'var(--chart-2)' } }} className="h-[220px] w-full">
            <BarChart data={roleData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="role" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Recent signups</h2>
          <Link to="/admin/users" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Link to={adminUserPath(u)} className="hover:underline">{u.email}</Link>
                </TableCell>
                <TableCell><AdminTierBadge tier={u.subscriptionTier} /></TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link to="/admin/users">Users</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/links">Links</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/feature-flags">Feature Flags</Link></Button>
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Flag className="w-4 h-4 text-muted-foreground" />
          <span>{enabledFlags} of {flags.length} features enabled</span>
        </div>
        <Link to="/admin/feature-flags" className="text-sm text-primary hover:underline">Manage flags</Link>
      </div>
    </div>
  );
}
