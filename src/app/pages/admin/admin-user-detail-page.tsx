import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Link as LinkIcon, Shield, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  cancelAdminSubscription,
  createAdminBillingPortalSession,
  fetchAdminUser,
  lookupAdminBillingUser,
  updateAdminUser,
} from '@/services/admin-api';
import type { AdminBillingUserLookup, AdminUser, SubscriptionTier, UserRole } from '@/types';
import { useAuth } from '@/app/contexts/auth-context';
import { AdminStatCard } from '../../components/admin/admin-stat-card';
import { AdminTierBadge } from '../../components/admin/admin-tier-badge';
import { AdminRoleBadge } from '../../components/admin/admin-role-badge';
import { AdminConfirmDialog } from '../../components/admin/admin-confirm-dialog';
import { AdminCardSkeleton, AdminErrorState } from '../../components/admin/admin-page-states';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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

const TIERS: SubscriptionTier[] = ['free', 'starter', 'growth', 'enterprise'];

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, checkAuth } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [pendingAdmin, setPendingAdmin] = useState<boolean | null>(null);
  const [confirmRole, setConfirmRole] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [confirmTier, setConfirmTier] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);
  const [saving, setSaving] = useState(false);
  const [billingInfo, setBillingInfo] = useState<AdminBillingUserLookup | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

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

  useEffect(() => {
    if (!user?.stripeCustomerId) {
      setBillingInfo(null);
      return;
    }
    let cancelled = false;
    setBillingLoading(true);
    void lookupAdminBillingUser(user.email)
      .then((data) => {
        if (!cancelled) setBillingInfo(data.user);
      })
      .catch(() => {
        if (!cancelled) setBillingInfo(null);
      })
      .finally(() => {
        if (!cancelled) setBillingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.stripeCustomerId]);

  const refreshSessionIfAffected = async (updatedUserId: string) => {
    if (currentUser?.id === updatedUserId) {
      await checkAuth();
    }
  };

  const applyAdmin = async (admin: boolean) => {
    if (!userId) return;
    setSaving(true);
    try {
      const data = await updateAdminUser(userId, { admin });
      setUser(data.user);
      await refreshSessionIfAffected(userId);
      toast.success(
        admin
          ? currentUser?.id === userId
            ? 'Platform admin granted'
            : 'Platform admin granted — user will see Admin after refresh'
          : currentUser?.id === userId
            ? 'Platform admin revoked'
            : 'Platform admin revoked'
      );
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
      await refreshSessionIfAffected(userId);
      toast.success('Team role updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
      setConfirmRole(false);
      setPendingRole(null);
    }
  };

  const applyTier = async (subscriptionTier: SubscriptionTier) => {
    if (!userId) return;
    setSaving(true);
    try {
      const data = await updateAdminUser(userId, { subscriptionTier });
      setUser(data.user);
      await refreshSessionIfAffected(userId);
      toast.success(
        currentUser?.id === userId
          ? 'Subscription tier updated'
          : 'Subscription tier updated — user will see changes after refresh'
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
      setConfirmTier(false);
      setPendingTier(null);
    }
  };

  const openPortal = async () => {
    if (!userId) return;
    setPortalLoading(true);
    try {
      const data = await createAdminBillingPortalSession(userId);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to open portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userId || !user) return;
    setCancelLoading(true);
    try {
      const data = await cancelAdminSubscription(userId);
      setBillingInfo(data.user);
      toast.success('Subscription set to cancel at period end');
      setCancelOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setCancelLoading(false);
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
              {user.teamId && (
                <div>
                  <dt className="text-muted-foreground">Team</dt>
                  <dd className="flex items-center gap-2 mt-1">
                    <UsersRound className="w-4 h-4 text-muted-foreground" />
                    <Link to={`/admin/teams/${user.teamId}`} className="text-primary hover:underline">
                      {user.teamName ?? 'View team'}
                    </Link>
                    {user.membershipRole && <AdminRoleBadge role={user.membershipRole} />}
                  </dd>
                </div>
              )}
              <div><dt className="text-muted-foreground">Provider</dt><dd>{user.provider ?? 'email'}</dd></div>
              <div><dt className="text-muted-foreground">Joined</dt><dd>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</dd></div>
              {user.stripeCustomerId && (
                <div><dt className="text-muted-foreground">Stripe customer</dt><dd className="font-mono text-xs">{user.stripeCustomerId}</dd></div>
              )}
            </dl>
          </div>

          {user.stripeCustomerId && (
            <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">Billing</h2>
                <Link to="/admin/billing" className="text-sm text-primary hover:underline">Billing dashboard</Link>
              </div>
              {billingLoading ? (
                <p className="text-sm text-muted-foreground">Loading subscription status…</p>
              ) : billingInfo ? (
                <div className="text-sm space-y-2">
                  <p className="flex flex-wrap items-center gap-2">
                    {billingInfo.subscriptionStatus && (
                      <Badge variant={billingInfo.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                        {billingInfo.subscriptionStatus}
                      </Badge>
                    )}
                    {billingInfo.cancelAtPeriodEnd && (
                      <Badge variant="outline">Cancels at period end</Badge>
                    )}
                  </p>
                  {billingInfo.currentPeriodEnd && (
                    <p className="text-muted-foreground">
                      Current period ends: {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" disabled={portalLoading} onClick={() => void openPortal()}>
                      Open Stripe portal
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
                      Cancel subscription
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active Stripe subscription found.</p>
              )}
            </div>
          )}

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
              <Label htmlFor="subscription-tier">Subscription tier (override)</Label>
              <Select
                value={user.subscriptionTier}
                onValueChange={(v) => {
                  setPendingTier(v as SubscriptionTier);
                  setConfirmTier(true);
                }}
              >
                <SelectTrigger id="subscription-tier"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Support override — does not change Stripe billing automatically.</p>
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
                        <Link to={`/admin/links/${link.id}`} className="text-primary hover:underline">
                          View
                        </Link>
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
        open={confirmTier}
        onOpenChange={setConfirmTier}
        title="Override subscription tier?"
        description={`Set tier to "${pendingTier}" for ${user.email}? This is a support override and may not match Stripe.`}
        confirmLabel="Update tier"
        loading={saving}
        onConfirm={() => pendingTier && applyTier(pendingTier)}
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

      <AdminConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel subscription?"
        description={`Set ${user.email}'s subscription to cancel at the end of the current billing period.`}
        confirmLabel="Cancel at period end"
        destructive
        loading={cancelLoading}
        onConfirm={() => void handleCancelSubscription()}
      />
    </div>
  );
}
