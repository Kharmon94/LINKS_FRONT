import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminUser, updateAdminUser } from '@/services/admin-api';
import type { AdminUser, UserRole } from '@/types';
import { useAuth } from '@/app/contexts/auth-context';
import { AdminStatCard } from '../../components/admin/admin-stat-card';
import { AdminTierBadge } from '../../components/admin/admin-tier-badge';
import { AdminRoleBadge } from '../../components/admin/admin-role-badge';
import { AdminConfirmDialog } from '../../components/admin/admin-confirm-dialog';
import { AdminCardSkeleton, AdminErrorState } from '../../components/admin/admin-page-states';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import { Link as LinkIcon } from 'lucide-react';

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [pendingAdmin, setPendingAdmin] = useState<boolean | null>(null);
  const [confirmRole, setConfirmRole] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUser(userId);
      setUser(data.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyAdmin = async (admin: boolean) => {
    if (!userId) return;
    setSaving(true);
    try {
      const data = await updateAdminUser(userId, { admin });
      setUser(data.user);
      toast.success(admin ? 'Platform admin granted' : 'Platform admin revoked');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
      setConfirmAdmin(false);
      setPendingAdmin(null);
    }
  };

  const applyRole = async (role: UserRole) => {
    if (!userId) return;
    setSaving(true);
    try {
      const data = await updateAdminUser(userId, { role });
      setUser(data.user);
      toast.success('Team role updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
      setConfirmRole(false);
      setPendingRole(null);
    }
  };

  if (loading) return <AdminCardSkeleton />;
  if (error || !user) return <AdminErrorState message={error ?? 'User not found'} onRetry={load} />;

  const isSelf = currentUser?.id === user.id;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/users">Users</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{user.email}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Back to users
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6 space-y-4">
            <h2 className="font-semibold">Profile</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Email</dt><dd>{user.email}</dd></div>
              <div><dt className="text-muted-foreground">Name</dt><dd>{user.name}</dd></div>
              <div className="flex gap-2 items-center"><dt className="text-muted-foreground">Tier</dt><dd><AdminTierBadge tier={user.subscriptionTier} /></dd></div>
              <div><dt className="text-muted-foreground">Provider</dt><dd>{user.provider ?? 'email'}</dd></div>
              <div><dt className="text-muted-foreground">Joined</dt><dd>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</dd></div>
              {user.stripeCustomerId && (
                <div><dt className="text-muted-foreground">Stripe customer</dt><dd className="font-mono text-xs">{user.stripeCustomerId}</dd></div>
              )}
            </dl>
          </div>

          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-destructive/30 p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" />Permissions</h2>
            <div className="flex items-center justify-between">
              <Label htmlFor="platform-admin">Platform admin</Label>
              <Switch
                id="platform-admin"
                checked={user.admin ?? false}
                onCheckedChange={(checked) => {
                  setPendingAdmin(checked);
                  setConfirmAdmin(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Team role</Label>
              <Select
                value={user.role}
                onValueChange={(v) => {
                  setPendingRole(v as UserRole);
                  setConfirmRole(true);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Team role — not the same as platform admin.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <AdminStatCard label="Links" value={user.linksCount ?? 0} icon={LinkIcon} />
            <AdminStatCard label="Role" value={user.role} icon={Shield} />
          </div>

          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent links</h2>
              <Link to={`/admin/links?user_id=${user.id}`} className="text-sm text-primary hover:underline">View all</Link>
            </div>
            {(user.recentLinks?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No links yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.recentLinks?.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <p className="font-medium">{link.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{link.shortCode}</p>
                      </TableCell>
                      <TableCell>{link.clicks}</TableCell>
                      <TableCell>
                        <a href={link.shortUrl} target="_blank" rel="noreferrer" className="text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <AdminConfirmDialog
        open={confirmAdmin}
        onOpenChange={setConfirmAdmin}
        title={pendingAdmin ? 'Grant platform admin?' : 'Revoke platform admin?'}
        description={
          isSelf && !pendingAdmin
            ? 'You will lose admin access to this dashboard immediately.'
            : 'This changes platform-level admin access, not team role.'
        }
        confirmLabel="Save"
        destructive={!pendingAdmin}
        loading={saving}
        onConfirm={() => pendingAdmin !== null && applyAdmin(pendingAdmin)}
      />

      <AdminConfirmDialog
        open={confirmRole}
        onOpenChange={setConfirmRole}
        title="Change team role?"
        description={`Set team role to "${pendingRole}" for ${user.email}?`}
        confirmLabel="Update role"
        loading={saving}
        onConfirm={() => pendingRole && applyRole(pendingRole)}
      />
    </div>
  );
}
