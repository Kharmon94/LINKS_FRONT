import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLinkAnalytics } from '@/services/analytics-api';
import { AnalyticsCharts } from '../components/analytics-charts';
import { toast } from 'sonner';

export function AnalyticsPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof getLinkAnalytics>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLinkAnalytics(linkId!);
        if (!cancelled) setAnalytics(data);
      } catch {
        if (!cancelled) setAnalytics(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [linkId]);

  const linkData = analytics?.link;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.startsWith('http') ? text : `https://${text}`);
    toast.success('Copied to clipboard');
  };

  return (
    <FeatureGate allowed={can.analytics} featureName="Analytics">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="px-4 py-8 max-w-7xl mx-auto relative">
            <Button variant="ghost" className="mb-6" onClick={() => navigate('/links')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Links
            </Button>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
            ) : analytics && linkData ? (
              <>
                <div className="bg-card rounded-lg p-6 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">Link Analytics</h1>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <ExternalLink className="w-4 h-4" />
                        <span className="truncate max-w-md">{linkData.originalUrl}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">{linkData.shortUrl}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(linkData.fullShortUrl || linkData.shortUrl)}
                          className="p-1 hover:bg-accent rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-1">{analytics.totalClicks.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Clicks</div>
                    </div>
                  </div>
                </div>

                <AnalyticsCharts
                  quickStats={analytics.quickStats}
                  clicksOverTime={analytics.clicksOverTime}
                  deviceBreakdown={analytics.deviceBreakdown}
                  topLocations={analytics.topLocations}
                />

                {analytics.referrerBreakdown && analytics.referrerBreakdown.length > 0 && (
                  <div className="bg-card rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4">Referrer Sources</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.referrerBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="source" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                          }}
                        />
                        <Bar dataKey="clicks" fill="#FBBC05" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Unable to load analytics</div>
            )}
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
