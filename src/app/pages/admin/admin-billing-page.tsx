import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CreditCard, RefreshCw, Search, Users } from 'lucide-react';
import {
  cancelAdminSubscription,
  createAdminBillingPortalSession,
  fetchAdminBillingOverview,
  fetchAdminStripeMode,
  lookupAdminBillingUser,
  updateAdminStripeMode,
} from '@/services/admin-api';
import type { AdminBillingOverview, AdminBillingUserLookup, AdminStripeMode } from '@/types';
import { AdminStatCard } from '../../components/admin/admin-stat-card';
import { AdminStatRowSkeleton, AdminErrorState } from '../../components/admin/admin-page-states';
import { AdminConfirmDialog } from '../../components/admin/admin-confirm-dialog';
import { AdminTierBadge } from '../../components/admin/admin-tier-badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
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
import { toast } from 'sonner';

function subscriptionStatusBadge(status?: string | null) {
  if (!status) return null;
  const variant = status === 'active' ? 'default' : status === 'canceled' ? 'destructive' : 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
}

export function AdminBillingPage() {
  const [overview, setOverview] = useState<AdminBillingOverview | null>(null);
  const [stripeMode, setStripeMode] = useState<AdminStripeMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<AdminBillingUserLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [liveConfirmOpen, setLiveConfirmOpen] = useState(false);
  const [modeUpdating, setModeUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, modeData] = await Promise.all([
        fetchAdminBillingOverview(),
        fetchAdminStripeMode(),
      ]);
      setOverview(overviewData.overview);
      setStripeMode(modeData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load billing overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const data = await lookupAdminBillingUser(lookupEmail.trim());
      setLookupResult(data.user);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'User not found');
    } finally {
      setLookupLoading(false);
    }
  };

  const openPortal = async () => {
    if (!lookupResult?.id) return;
    setPortalLoading(true);
    try {
      const data = await createAdminBillingPortalSession(lookupResult.id);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to open portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!lookupResult?.id) return;
    setCancelLoading(true);
    try {
      await cancelAdminSubscription(lookupResult.id);
      toast.success('Subscription set to cancel at period end');
      setCancelOpen(false);
      const data = await lookupAdminBillingUser(lookupResult.email);
      setLookupResult(data.user);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setCancelLoading(false);
    }
  };

  const applyStripeMode = async (live: boolean) => {
    setModeUpdating(true);
    try {
      const mode = await updateAdminStripeMode(live);
      setStripeMode(mode);
      setOverview((prev) => (prev ? { ...prev, stripeMode: live ? 'live' : 'test' } : prev));
      toast.success(live ? 'Stripe live mode enabled' : 'Stripe test mode enabled');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update Stripe mode');
    } finally {
      setModeUpdating(false);
      setLiveConfirmOpen(false);
    }
  };

  const handleModeToggle = (checked: boolean) => {
    if (checked) {
      setLiveConfirmOpen(true);
      return;
    }
    void applyStripeMode(false);
  };

  if (loading && !overview) {
    return (
      <div className="space-y-6">
        <AdminStatRowSkeleton />
        <AdminStatRowSkeleton count={2} />
      </div>
    );
  }

  if (error && !overview) {
    return <AdminErrorState message={error} onRetry={load} />;
  }

  if (!overview) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Billing</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Billing</h1>
            {stripeMode && (
              <Badge variant={stripeMode.live ? 'destructive' : 'secondary'}>
                Stripe {stripeMode.live ? 'Live' : 'Test'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">MRR, subscription lookup, and Stripe operations</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {stripeMode && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Stripe mode</h2>
              <p className="text-sm text-muted-foreground">
                Controls which Stripe API keys checkout and admin billing use.
                {stripeMode.source === 'database' ? ' Stored in database.' : ' Using env fallback.'}
              </p>
              <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                <span>Test keys: {stripeMode.testConfigured ? 'configured' : 'missing'}</span>
                <span>·</span>
                <span>Live keys: {stripeMode.liveConfigured ? 'configured' : 'missing'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="stripe-live-mode" className="text-sm">Live mode</Label>
              <Switch
                id="stripe-live-mode"
                checked={stripeMode.live}
                disabled={modeUpdating || !stripeMode.liveConfigured}
                onCheckedChange={handleModeToggle}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          label="Est. MRR"
          value={overview.mrrFormatted}
          icon={CreditCard}
          hint={overview.mrrSource === 'stripe' ? 'From Stripe prices' : 'Plan fallback prices'}
        />
        <AdminStatCard
          label="Paid subscribers"
          value={overview.paidSubscribers}
          icon={Users}
        />
        <AdminStatCard
          label="Stripe linked"
          value={overview.stripeLinkedUsers}
          icon={CreditCard}
        />
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Subscribers by tier</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(overview.subscribersByTier).map(([tier, count]) => (
            <div key={tier} className="text-center p-4 bg-muted/30 rounded-lg">
              <AdminTierBadge tier={tier as import('@/types').SubscriptionTier} />
              <p className="text-2xl font-bold mt-2">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Lookup by email</h2>
        <form onSubmit={handleLookup} className="flex gap-2 mb-4">
          <Input
            type="email"
            placeholder="user@example.com"
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" disabled={lookupLoading}>
            <Search className="w-4 h-4 mr-2" />
            Lookup
          </Button>
        </form>
        {lookupResult && (
          <div className="text-sm space-y-3 p-4 bg-muted/30 rounded-lg">
            <p><strong>{lookupResult.name}</strong> ({lookupResult.email})</p>
            <p className="flex items-center gap-2">
              Tier: <AdminTierBadge tier={lookupResult.subscriptionTier} />
              {subscriptionStatusBadge(lookupResult.subscriptionStatus)}
              {lookupResult.cancelAtPeriodEnd && (
                <Badge variant="outline">Cancels at period end</Badge>
              )}
            </p>
            <p>Stripe customer: {lookupResult.stripeCustomerId || 'Not linked'}</p>
            {lookupResult.currentPeriodEnd && (
              <p>Current period ends: {new Date(lookupResult.currentPeriodEnd).toLocaleDateString()}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to={`/admin/users/${lookupResult.id}`} className="text-primary underline text-sm">
                View user profile
              </Link>
              {lookupResult.hasStripeCustomer && (
                <>
                  <Button variant="outline" size="sm" disabled={portalLoading} onClick={() => void openPortal()}>
                    Open Stripe portal
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
                    Cancel subscription
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Recent billing events</h2>
        {overview.recentEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No billing events recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.recentEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs">{event.eventType}</TableCell>
                  <TableCell>{event.email}</TableCell>
                  <TableCell><AdminTierBadge tier={event.tier} /></TableCell>
                  <TableCell>{event.amountFormatted ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(event.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AdminConfirmDialog
        open={liveConfirmOpen}
        onOpenChange={setLiveConfirmOpen}
        title="Enable Stripe live mode?"
        description="Checkout and billing operations will use live Stripe keys. Real charges will be processed. Confirm only when you are ready for production billing."
        confirmLabel="Enable live mode"
        destructive
        loading={modeUpdating}
        onConfirm={() => void applyStripeMode(true)}
      />

      <AdminConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel subscription?"
        description={`Set ${lookupResult?.email}'s subscription to cancel at the end of the current billing period.`}
        confirmLabel="Cancel at period end"
        destructive
        loading={cancelLoading}
        onConfirm={() => void handleCancel()}
      />
    </div>
  );
}
