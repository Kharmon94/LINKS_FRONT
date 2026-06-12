import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { UsersRound } from 'lucide-react';
import { fetchAdminTeams } from '@/services/admin-api';
import type { AdminTeam, PaginationMeta } from '@/types';
import { useAdminQuery } from '@/app/hooks/use-admin-query';
import { AdminSearchInput } from '../../components/admin/admin-search-input';
import { AdminPagination } from '../../components/admin/admin-pagination';
import { AdminStatCard } from '../../components/admin/admin-stat-card';
import { AdminTableSkeleton, AdminEmptyState, AdminErrorState } from '../../components/admin/admin-page-states';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
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

type PersonalFilter = '' | 'true' | 'false';

export function AdminTeamsPage() {
  const { q, page, setQuery, apiParams } = useAdminQuery();
  const [personalFilter, setPersonalFilter] = useState<PersonalFilter>('');
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, perPage: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(apiParams);
      if (personalFilter) params.set('personal', personalFilter);
      const data = await fetchAdminTeams(params);
      setTeams(data.teams);
      setMeta(data.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [apiParams, personalFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const personalOnPage = teams.filter((team) => team.personal).length;

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
        <p className="text-muted-foreground text-sm">Team accounts, members, and workspaces</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard label="Total teams" value={meta.total} icon={UsersRound} />
        <AdminStatCard
          label="Members (this page)"
          value={teams.reduce((sum, team) => sum + team.memberCount, 0)}
          icon={UsersRound}
        />
        <AdminStatCard label="Personal (this page)" value={personalOnPage} icon={UsersRound} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(['', 'true', 'false'] as PersonalFilter[]).map((value) => (
            <Button
              key={value || 'all'}
              variant={personalFilter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPersonalFilter(value)}
            >
              {value === '' ? 'All' : value === 'true' ? 'Personal' : 'Shared'}
            </Button>
          ))}
        </div>
        <AdminSearchInput value={q} onChange={(v) => setQuery({ q: v })} placeholder="Search team or owner email…" />
      </div>

      {error && <AdminErrorState message={error} onRetry={load} />}

      {loading ? (
        <AdminTableSkeleton />
      ) : teams.length === 0 ? (
        <AdminEmptyState icon={UsersRound} title="No teams found" description="Adjust filters or search." />
      ) : (
        <>
          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Workspaces</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <Link to={`/admin/teams/${team.id}`} className="hover:underline font-medium">
                        {team.name}
                      </Link>
                      {team.personal && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Personal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{team.ownerEmail ?? '—'}</TableCell>
                    <TableCell>{team.memberCount}</TableCell>
                    <TableCell>{team.workspaceCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'}
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
