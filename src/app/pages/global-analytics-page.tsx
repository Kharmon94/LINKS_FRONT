import { useEffect, useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { BarChart3, TrendingUp, FolderKanban } from 'lucide-react';
import { getAnalyticsOverview, type OverviewAnalytics } from '@/services/analytics-api';
import { AnalyticsCharts } from '../components/analytics-charts';
import { formatRelativeTime } from '@/lib/format-relative-time';

function formatClickGrowth(growth: number): string {
  if (growth === 0) return 'No change this week';
  return `${growth > 0 ? '+' : ''}${growth}% this week`;
}

export function GlobalAnalyticsPage() {
  const { can } = usePermissions();
  const [stats, setStats] = useState<OverviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAnalyticsOverview();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FeatureGate allowed={can.analytics} featureName="Analytics">
      <AppLayout>
        <div className="min-h-screen bg-background relative mx-[0px] mt-[20px] mb-[0px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 py-6 relative">
            <div className="mb-6">
              <h1 className="text-3xl mb-2 text-center">Global Analytics</h1>
              <p className="text-sm text-muted-foreground text-center">
                Track performance across all your links and campaigns
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card rounded-lg p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Total Clicks</p>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.totalClicks.toLocaleString()}</p>
                    <p className="text-xs text-green-500 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {formatClickGrowth(stats.clickGrowth)}
                    </p>
                  </div>

                  <div className="bg-card rounded-lg p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Total Links</p>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.totalLinks}</p>
                    <p className="text-xs text-muted-foreground">Active links</p>
                  </div>

                  <div className="bg-card rounded-lg p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Campaigns</p>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.totalCampaigns}</p>
                    <p className="text-xs text-muted-foreground">Active campaigns</p>
                  </div>

                  <div className="bg-card rounded-lg p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Avg. Clicks</p>
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      {stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Per link</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-card rounded-lg p-5 shadow-lg">
                    <h2 className="mb-4 text-[28px] text-center">Top Links</h2>
                    <div className="space-y-4">
                      {stats.topLinks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">No data yet</p>
                      ) : (
                        stats.topLinks.map((link) => (
                          <div key={link.shortUrl}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium truncate flex-1 mr-4">{link.shortUrl}</span>
                              <span className="text-sm font-bold">{link.clicks.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${link.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-5 shadow-lg">
                    <h2 className="mb-4 text-[28px] text-center">Top Campaigns</h2>
                    <div className="space-y-4">
                      {stats.topCampaigns.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">No campaigns yet</p>
                      ) : (
                        stats.topCampaigns.map((campaign) => (
                          <div key={campaign.campaign}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 mr-4">
                                <FolderKanban className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{campaign.campaign}</span>
                              </div>
                              <span className="text-sm font-bold">{campaign.clicks.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${campaign.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {stats.topWorkspaces.length > 0 && (
                    <div className="bg-card rounded-lg p-5 shadow-lg">
                      <h2 className="mb-4 text-[28px] text-center">Top Workspaces</h2>
                      <div className="space-y-4">
                        {stats.topWorkspaces.map((workspace) => (
                          <div key={workspace.name}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{workspace.name}</span>
                              <span className="text-sm font-bold">{workspace.clicks.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${workspace.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {(stats.clicksOverTime || stats.deviceBreakdown) && (
                  <div className="mb-6">
                    <AnalyticsCharts
                      clicksOverTime={stats.clicksOverTime}
                      deviceBreakdown={stats.deviceBreakdown}
                      showQuickStats={false}
                      showLocations={false}
                    />
                  </div>
                )}

                <div className="bg-card rounded-lg p-5 shadow-lg">
                  <h2 className="mb-4 text-[28px] text-center">Recent Activity</h2>
                  <div className="space-y-3">
                    {!stats.recentClicks || stats.recentClicks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
                    ) : (
                      stats.recentClicks.map((click) => (
                        <div
                          key={click.id}
                          className="flex items-start justify-between gap-4 pb-3 last:pb-0 border-b border-border/30 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">
                              Link clicked: {click.shortUrl}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(click.timestamp)}
                            </p>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
                            +1 click
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
