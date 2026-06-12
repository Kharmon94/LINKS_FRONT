import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Activity, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { checkHealth, fetchAdminHealth } from '@/services/admin-api';
import type { AdminHealthStatus } from '@/types';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { AdminCardSkeleton } from '../../components/admin/admin-page-states';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';

interface PublicHealthResult {
  ok: boolean;
  status: number;
  latencyMs: number;
  checkedAt: Date;
}

function StatusCard({
  title,
  ok,
  detail,
}: {
  title: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div className={`bg-card/50 backdrop-blur-md rounded-lg border p-5 ${ok ? 'border-emerald-500/30' : 'border-destructive/30'}`}>
      <div className="flex items-center gap-3 mb-2">
        {ok ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export function AdminHealthPage() {
  const [health, setHealth] = useState<AdminHealthStatus | null>(null);
  const [publicHealth, setPublicHealth] = useState<PublicHealthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runCheck = useCallback(async () => {
    setLoading(true);
    try {
      const [adminData, upData] = await Promise.all([
        fetchAdminHealth(),
        checkHealth(),
      ]);
      setHealth(adminData.health);
      setPublicHealth({
        ok: upData.ok,
        status: upData.status,
        latencyMs: upData.latencyMs,
        checkedAt: new Date(),
      });
    } catch {
      setHealth(null);
      setPublicHealth({ ok: false, status: 0, latencyMs: 0, checkedAt: new Date() });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => void runCheck(), 30_000);
    return () => clearInterval(id);
  }, [autoRefresh, runCheck]);

  const allOk = health?.database.ok && (health.redis.skipped || health.redis.ok) && publicHealth?.ok;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Health</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">System health</h1>
          <p className="text-muted-foreground text-sm">Authenticated service checks + public /up</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-refresh">Auto-refresh (30s)</Label>
          </div>
          <Button variant="outline" size="sm" onClick={() => void runCheck()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check now
          </Button>
        </div>
      </div>

      {loading && !health ? (
        <AdminCardSkeleton />
      ) : health && (
        <>
          <div className={`bg-card/50 backdrop-blur-md rounded-lg border p-6 ${allOk ? 'border-emerald-500/30' : 'border-destructive/30'}`}>
            <div className="flex items-center gap-3">
              {allOk ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <XCircle className="w-8 h-8 text-destructive" />}
              <div>
                <h2 className="text-xl font-semibold">{allOk ? 'All systems operational' : 'Degraded'}</h2>
                <p className="text-sm text-muted-foreground">
                  Version {health.version ?? 'unknown'}
                  {health.migrationVersion != null && ` · migration ${health.migrationVersion}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatusCard
              title="Database"
              ok={health.database.ok}
              detail={health.database.ok ? `${health.database.latencyMs}ms` : 'Connection failed'}
            />
            <StatusCard
              title="Redis"
              ok={health.redis.skipped ? true : health.redis.ok}
              detail={
                health.redis.skipped
                  ? 'Skipped (REDIS_URL unset)'
                  : health.redis.ok
                    ? `${health.redis.latencyMs ?? 0}ms`
                    : 'Unreachable'
              }
            />
            <StatusCard
              title="Stripe"
              ok={health.stripe.configured}
              detail={health.stripe.configured ? 'API key configured' : 'STRIPE_SECRET_KEY missing'}
            />
            <StatusCard
              title="Public /up"
              ok={publicHealth?.ok ?? false}
              detail={
                publicHealth
                  ? `HTTP ${publicHealth.status} · ${publicHealth.latencyMs}ms`
                  : 'Not checked'
              }
            />
          </div>
        </>
      )}

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-2"><Activity className="w-4 h-4" />Operational notes</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>Check Railway deployment logs for recent errors.</li>
          <li>Database migrations run via docker-entrypoint on deploy.</li>
          <li>Stripe admin billing actions require STRIPE_SECRET_KEY in production.</li>
        </ul>
      </div>
    </div>
  );
}
