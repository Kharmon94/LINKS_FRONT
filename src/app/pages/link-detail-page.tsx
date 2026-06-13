import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { useLiveRefresh } from '@/hooks/use-live-refresh';
import { ANALYTICS_DETAIL_POLL_INTERVAL_MS } from '../config/analytics-refresh';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Edit,
  Clock,
  ChevronDown,
  ChevronUp,
  QrCode,
  Nfc,
} from 'lucide-react';
import { getLink, getLinkClicks, displayShortUrl } from '@/services/links-api';
import { getLinkAnalytics, type EntityAnalytics } from '@/services/analytics-api';
import { AnalyticsCharts } from '../components/analytics-charts';
import { ApiError } from '@/services/api';
import type { LinkJson, ClickEventJson } from '@/types';

export function LinkDetailPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [link, setLink] = useState<LinkJson | null>(null);
  const [analytics, setAnalytics] = useState<EntityAnalytics | null>(null);
  const [recentClicks, setRecentClicks] = useState<ClickEventJson[]>([]);
  const [linkLoading, setLinkLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [clicksLoading, setClicksLoading] = useState(false);
  const [analyticsDenied, setAnalyticsDenied] = useState(false);
  const [isRecentClicksOpen, setIsRecentClicksOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const [isQuickStatsOpen, setIsQuickStatsOpen] = useState(true);

  const loadLinkData = useCallback(
    async ({ silent }: { silent: boolean }) => {
      if (!linkId) return;
      if (!silent) {
        setLinkLoading(true);
        setAnalyticsLoading(can.analytics);
        setClicksLoading(true);
        setAnalyticsDenied(false);
      }

      const linkPromise = getLink(linkId)
        .then((linkData) => setLink(linkData))
        .catch(() => setLink(null))
        .finally(() => {
          if (!silent) setLinkLoading(false);
        });

      const analyticsPromise = can.analytics
        ? getLinkAnalytics(linkId)
            .then((analyticsData) => setAnalytics(analyticsData))
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

      const clicksPromise = getLinkClicks(linkId, 1, 10)
        .then((clicksData) => setRecentClicks(clicksData.clicks))
        .catch(() => setRecentClicks([]))
        .finally(() => {
          if (!silent) setClicksLoading(false);
        });

      await Promise.all([linkPromise, analyticsPromise, clicksPromise]);
    },
    [linkId, can.analytics],
  );

  const { refreshNow } = useLiveRefresh(loadLinkData, {
    intervalMs: ANALYTICS_DETAIL_POLL_INTERVAL_MS,
    enabled: !!linkId,
  });

  const prevLinkIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!linkId) return;
    if (prevLinkIdRef.current !== undefined && prevLinkIdRef.current !== linkId) {
      setLink(null);
      setAnalytics(null);
      setRecentClicks([]);
      void refreshNow();
    }
    prevLinkIdRef.current = linkId;
  }, [linkId, refreshNow]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (linkLoading) {
    return (
      <FeatureGate allowed={can.readLinks} featureName="Links">
        <AppLayout>
          <div className="text-center py-12 text-muted-foreground">Loading link...</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  if (!link) {
    return (
      <FeatureGate allowed={can.readLinks} featureName="Links">
        <AppLayout>
          <div className="text-center py-12 text-muted-foreground">Link not found</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  const fullShortUrl = displayShortUrl(link);

  const handleExportQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(fullShortUrl, { width: 512, margin: 2 });
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `${link.shortCode || 'link'}-qr.png`;
      anchor.click();
      toast.success('QR code downloaded');
    } catch {
      toast.error('Could not generate QR code');
    }
  };

  const handleExportNFC = () => {
    const payload = `URI:${fullShortUrl}`;
    const blob = new Blob([payload], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${link.shortCode || 'link'}.nfc`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    navigator.clipboard.writeText(fullShortUrl);
    toast.success('NFC payload downloaded and URL copied');
  };

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const formatLocation = (click: ClickEventJson) =>
    [click.city, click.country].filter(Boolean).join(', ') || 'Unknown';

  return (
    <FeatureGate allowed={can.readLinks} featureName="Links">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="px-4 py-8 max-w-5xl mx-auto relative">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link to="/links" className="hover:text-foreground">
                Links
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{link.name}</span>
            </nav>

            <Button variant="ghost" onClick={() => navigate('/links')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Links
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="mb-2 text-[32px]">{link.name}</h1>
                <p className="text-sm text-muted-foreground mb-2 truncate max-w-lg">{link.originalUrl}</p>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-medium">{link.shortUrl}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(fullShortUrl)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(fullShortUrl, '_blank')}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleExportQR}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR
                </Button>
                <Button variant="outline" onClick={handleExportNFC}>
                  <Nfc className="w-4 h-4 mr-2" />
                  NFC
                </Button>
                {can.updateLinks && (
                  <Button onClick={() => navigate(`/links/${link.id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Link
                  </Button>
                )}
              </div>
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
                    {isQuickStatsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {isQuickStatsOpen && (
                    <div className="px-6 pb-6">
                      {analyticsLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading stats...</p>
                      ) : analyticsDenied ? (
                        <p className="text-sm text-muted-foreground py-4">Analytics unavailable for your plan.</p>
                      ) : analytics?.quickStats ? (
                        <>
                          <AnalyticsCharts quickStats={analytics.quickStats} showLocations={false} />
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="font-medium">
                                {new Date(link.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Campaign</p>
                              <p className="font-medium">{link.campaign?.name || 'None'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No analytics data yet</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsRecentClicksOpen(!isRecentClicksOpen)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
                >
                  <h2 className="text-2xl">Recent Clicks</h2>
                  {isRecentClicksOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {isRecentClicksOpen && (
                  <div className="px-6 pb-6">
                    {clicksLoading ? (
                      <p className="text-center text-muted-foreground py-6">Loading clicks...</p>
                    ) : recentClicks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">No clicks yet</p>
                    ) : (
                      <div className="space-y-2">
                        {recentClicks.map((click) => (
                          <div
                            key={click.id}
                            className="flex justify-between items-center p-3 bg-muted/20 rounded-lg text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{formatTimestamp(click.timestamp)}</span>
                            </div>
                            <div className="text-right text-muted-foreground">
                              {formatLocation(click)}
                              {click.device ? ` · ${click.device}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {isAnalyticsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                          poolBreakdown={analytics.poolBreakdown}
                          showQuickStats={false}
                          showReferrers
                          showPoolBreakdown={link.isRandomizer}
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
