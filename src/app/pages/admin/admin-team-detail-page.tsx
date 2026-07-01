import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, UsersRound } from 'lucide-react';
import { fetchAdminTeam } from '@/services/admin-api';
import type { AdminTeam } from '@/types';
import { adminTeamPath, adminUserPath } from '@/lib/resource-paths';
import { usePublicIdRedirect } from '@/hooks/use-public-id-redirect';
import { AdminRoleBadge } from '../../components/admin/admin-role-badge';
import { AdminCardSkeleton, AdminErrorState } from '../../components/admin/admin-page-states';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export function AdminTeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<AdminTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePublicIdRedirect('teamId', team, adminTeamPath);

  const load = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTeam(teamId);
      setTeam(data.team);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminCardSkeleton />;
  if (error || !team) return <AdminErrorState message={error ?? 'Team not found'} onRetry={load} />;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/teams">Teams</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{team.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/teams')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Back to teams
      </Button>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <UsersRound className="w-5 h-5" />
          <h1 className="text-2xl font-semibold">{team.name}</h1>
          {team.personal && <Badge variant="secondary">Personal</Badge>}
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><dt className="text-muted-foreground">Owner</dt><dd>{team.ownerEmail ?? '—'}</dd></div>
          <div><dt className="text-muted-foreground">Members</dt><dd>{team.memberCount}</dd></div>
          <div><dt className="text-muted-foreground">Workspaces</dt><dd>{team.workspaceCount}</dd></div>
          <div><dt className="text-muted-foreground">Created</dt><dd>{team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'}</dd></div>
        </dl>
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6">
        <h2 className="font-semibold mb-4">Members</h2>
        {(team.members?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No members.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Link to={adminUserPath(member)} className="hover:underline">{member.email}</Link>
                    <p className="text-xs text-muted-foreground">{member.name}</p>
                  </TableCell>
                  <TableCell><AdminRoleBadge role={member.role} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6">
        <h2 className="font-semibold mb-4">Pending invitations</h2>
        {(team.invitations?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No pending invitations.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.invitations?.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.email}</TableCell>
                  <TableCell><AdminRoleBadge role={inv.role} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6">
        <h2 className="font-semibold mb-4">Workspaces</h2>
        {(team.workspaces?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No workspaces.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.workspaces?.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell>{ws.name}</TableCell>
                  <TableCell>{ws.linksCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
