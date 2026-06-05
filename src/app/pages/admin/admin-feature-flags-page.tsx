import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { fetchFeatureFlags, updateFeatureFlag } from '@/services/admin-api';
import type { FeatureFlagJson } from '@/types';
import { AdminCardSkeleton, AdminErrorState } from '../../components/admin/admin-page-states';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';

export function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlagJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeatureFlags();
      setFlags(data.featureFlags);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = [...new Set(flags.map((f) => f.category))];

  const toggle = async (flag: FeatureFlagJson, enabled: boolean) => {
    setToggling(flag.key);
    const prev = flags;
    setFlags((f) => f.map((x) => (x.key === flag.key ? { ...x, enabled } : x)));
    try {
      const data = await updateFeatureFlag(flag.key, enabled);
      setFlags((f) => f.map((x) => (x.key === flag.key ? data.featureFlag : x)));
      toast.success(`${flag.key} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (e) {
      setFlags(prev);
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <AdminCardSkeleton />;
  if (error) return <AdminErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Feature Flags</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Flag className="w-6 h-6" />Feature Flags</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Toggles affect live permissions for all users on their next session refresh.
        </p>
      </div>

      <Tabs defaultValue={categories[0] ?? 'product'}>
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>
        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-4 mt-4">
            {flags.filter((f) => f.category === cat).map((flag) => (
              <div key={flag.key} className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono">{flag.key}</code>
                    <Badge variant="secondary">{flag.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last changed {flag.updatedAt ? new Date(flag.updatedAt).toLocaleString() : '—'}
                  </p>
                </div>
                <Switch
                  checked={flag.enabled}
                  disabled={toggling === flag.key}
                  onCheckedChange={(checked) => void toggle(flag, checked)}
                />
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
