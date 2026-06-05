import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Activity, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { checkHealth } from '@/services/admin-api';
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

interface HealthResult {
  ok: boolean;
  status: number;
  latencyMs: number;
  body: string;
  url: string;
  checkedAt: Date;
}

export function AdminHealthPage() {
  const [result, setResult] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runCheck = useCallback(async () => {
    setLoading(true);
    try {
      const data = await checkHealth();
      setResult({ ...data, checkedAt: new Date() });
    } catch {
      setResult({
        ok: false,
        status: 0,
        latencyMs: 0,
        body: 'Request failed',
        url: '/up',
        checkedAt: new Date(),
      });
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
          <p className="text-muted-foreground text-sm">API uptime via GET /up</p>
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

      {loading && !result ? (
        <AdminCardSkeleton />
      ) : result && (
        <div className={`bg-card/50 backdrop-blur-md rounded-lg border p-8 ${result.ok ? 'border-emerald-500/30' : 'border-destructive/30'}`}>
          <div className="flex items-center gap-4 mb-6">
            {result.ok ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            ) : (
              <XCircle className="w-12 h-12 text-destructive" />
            )}
            <div>
              <h2 className="text-2xl font-semibold">{result.ok ? 'Operational' : 'Degraded'}</h2>
              <p className="text-muted-foreground">HTTP {result.status} · {result.latencyMs}ms</p>
            </div>
          </div>
          <dl className="text-sm space-y-2">
            <div><dt className="text-muted-foreground inline">URL: </dt><dd className="inline font-mono">{result.url}</dd></div>
            <div><dt className="text-muted-foreground inline">Checked: </dt><dd className="inline">{result.checkedAt.toLocaleString()}</dd></div>
            <div><dt className="text-muted-foreground">Response</dt><dd className="font-mono text-xs bg-muted p-2 rounded mt-1">{result.body.slice(0, 200)}</dd></div>
          </dl>
        </div>
      )}

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-2"><Activity className="w-4 h-4" />Operational notes</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>Check Railway deployment logs for recent errors.</li>
          <li>Review deploy history in your hosting dashboard.</li>
          <li>Database migrations run via docker-entrypoint on deploy.</li>
        </ul>
      </div>
    </div>
  );
}
