import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { useLiveRefresh } from '@/hooks/use-live-refresh';
import { ANALYTICS_DETAIL_POLL_INTERVAL_MS } from '../config/analytics-refresh';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus, Copy, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { getCampaign, type CampaignJson, type LinkInCampaign } from '@/services/campaigns-api';
import { getCampaignAnalytics, type EntityAnalytics, type ClickEventJson } from '@/services/analytics-api';
import { AnalyticsCharts } from '../components/analytics-charts';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function CampaignDetailPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [campaign, setCampaign] = useState<CampaignJson | null>(null);
  const [analytics, setAnalytics] = useState<EntityAnalytics | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsDenied, setAnalyticsDenied] = useState(false);
  const [isQuickStatsOpen, setIsQuickStatsOpen] = useState(true);
  const [isRecentClicksOpen, setIsRecentClicksOpen] = useState(true);
  const [isCampaignLinksOpen, setIsCampaignLinksOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);

  const loadCampaignData = useCallback(
    async ({ silent }: { silent: boolean }) => {
      if (!campaignId) return;
      if (!silent) {
        setCampaignLoading(true);
        setAnalyticsLoading(can.analytics);
        setAnalyticsDenied(false);
      }

      const campaignPromise = getCampaign(campaignId)
        .then((camp) => setCampaign(camp))
        .catch((err) => {
          if (!silent) {
            toast.error(err instanceof ApiError ? err.message : 'Failed to load campaign');
          }
          setCampaign(null);
        })
        .finally(() => {
          if (!silent) setCampaignLoading(false);
        });

      const analyticsPromise = can.analytics
        ? getCampaignAnalytics(campaignId)
            .then((stats) => setAnalytics(stats))
            .catch((err) => {
              setAnalytics(null);
              if (err instanceof ApiError && err.status === 403) {
                setAnalyticsDenied(true);
              }
            })
            .finally(() => {
              if (!silent) setAnalyticsLoading(false);
            })
        : Promise.resolve();

      await Promise.all([campaignPromise, analyticsPromise]);
    },
    [campaignId, can.analytics],
  );

  const { refreshNow } = useLiveRefresh(loadCampaignData, {
    intervalMs: ANALYTICS_DETAIL_POLL_INTERVAL_MS,
    enabled: !!campaignId,
  });

  const prevCampaignIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!campaignId) return;
    if (prevCampaignIdRef.current !== undefined && prevCampaignIdRef.current !== campaignId) {
      setCampaign(null);
      setAnalytics(null);
      void refreshNow();
    }
    prevCampaignIdRef.current = campaignId;
  }, [campaignId, refreshNow]);

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const links = campaign?.links ?? [];
  const recentClicks = analytics?.recentClicks ?? [];

  if (campaignLoading) {
    return (
      <FeatureGate allowed={can.readCampaigns} featureName="Campaigns">
        <AppLayout>
          <div className="text-center py-24 text-muted-foreground">Loading campaign...</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  if (!campaign) {
    return (
      <FeatureGate allowed={can.readCampaigns} featureName="Campaigns">
        <AppLayout>
          <div className="text-center py-24 text-muted-foreground">Campaign not found</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate allowed={can.readCampaigns} featureName="Campaigns">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 py-8 relative">
            <Button variant="ghost" onClick={() => navigate('/campaigns')} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="mb-2 text-center md:text-left text-[32px]">{campaign.name}</h1>
                <p className="text-muted-foreground">{campaign.description}</p>
              </div>
              {can.updateCampaigns && (
                <Button
                  onClick={() => navigate(`/campaigns/${campaignId}/edit`)}
                  className="mx-auto md:ml-auto md:mr-0 md:shrink-0 rounded-full h-11 px-6"
                >
                  Edit Campaign
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {can.analytics && (
                <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
                  <button
                    type="button"
                    onClick={() => setIsQuickStatsOpen(!isQuickStatsOpen)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
                  >
                    <h2 className="text-2xl">Quick Stats</h2>
                    {isQuickStatsOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {isQuickStatsOpen && (
                    <div className="px-6 pb-6">
                      {analyticsLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading stats...</p>
                      ) : analyticsDenied ? (
                        <p className="text-sm text-muted-foreground py-4">Analytics unavailable for your plan.</p>
                      ) : analytics?.quickStats ? (
                        <>
                          <AnalyticsCharts
                            quickStats={analytics.quickStats}
                            showQuickStats
                            showLocations={false}
                          />
                          <p className="text-sm text-muted-foreground mt-4">
                            Created{' '}
                            {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No analytics data yet</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {can.analytics && (
                <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
                  <button
                    type="button"
                    onClick={() => setIsRecentClicksOpen(!isRecentClicksOpen)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
                  >
                    <h2 className="text-2xl">Recent Clicks</h2>
                    {isRecentClicksOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {isRecentClicksOpen && (
                    <div className="px-6 pb-6">
                      {analyticsLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Loading clicks...</p>
                      ) : recentClicks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No clicks yet</p>
                      ) : (
                        <div className="space-y-3">
                          {recentClicks.map((click: ClickEventJson) => (
                            <div
                              key={click.id}
                              className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border-b border-border/30"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                {formatTimestamp(click.timestamp)}
                              </div>
                              <div className="text-sm font-mono">{click.linkName}</div>
                              <div className="text-sm">{click.device}</div>
                              <div className="text-sm text-muted-foreground truncate">{click.referrer}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsCampaignLinksOpen(!isCampaignLinksOpen)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
                >
                  <h2 className="text-2xl">Campaign Links</h2>
                  {isCampaignLinksOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {isCampaignLinksOpen && (
                  <div className="px-6 pb-6">
                    <div className="space-y-3 mb-6">
                      {links.map((link: LinkInCampaign) => (
                        <div
                          key={link.id}
                          onClick={() => navigate(`/links/${link.id}`)}
                          className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-4 hover:shadow-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {link.name && <div className="font-semibold mb-1 truncate">{link.name}</div>}
                              <div className="flex items-center gap-2 mb-1">
                                <span className="truncate text-sm">{link.shortUrl}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(link.fullShortUrl || `https://${link.shortUrl}`);
                                    toast.success('Copied to clipboard');
                                  }}
                                  className="p-1 hover:bg-muted rounded shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{link.originalUrl}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl font-light">{link.clicks.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">clicks</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        onClick={() => navigate(`/campaigns/${campaignId}/add-links`)}
                        className="rounded-full h-11 px-6"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Links to Campaign
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {can.analytics && (
                <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
                  <button
                    type="button"
                    onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
                  >
                    <h2 className="text-2xl">Analytics</h2>
                    {isAnalyticsOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {isAnalyticsOpen && (
                    <div className="px-6 pb-6">
                      {analyticsLoading ? (
                        <p className="text-sm text-muted-foreground py-8">Loading analytics...</p>
                      ) : analyticsDenied ? (
                        <p className="text-sm text-muted-foreground py-8">Analytics unavailable for your plan.</p>
                      ) : analytics ? (
                        <AnalyticsCharts
                          clicksOverTime={analytics.clicksOverTime}
                          deviceBreakdown={analytics.deviceBreakdown}
                          topLocations={analytics.topLocations}
                          referrerBreakdown={analytics.referrerBreakdown}
                          showQuickStats={false}
                          showReferrers
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground py-8">No analytics data yet</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
