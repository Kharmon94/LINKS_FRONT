import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { apiRequest } from '@/services/api';
import { listCampaigns, type CampaignJson } from '@/services/campaigns-api';
import { getAnalyticsOverview } from '@/services/analytics-api';
import { displayShortUrl } from '@/services/links-api';
import { toast } from 'sonner';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { LinkCreatorForm } from '../components/link-creator-form';
import { usePermissions } from '@/hooks/use-permissions';
import { useLiveRefresh } from '@/hooks/use-live-refresh';
import { ANALYTICS_POLL_INTERVAL_MS } from '../config/analytics-refresh';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { UserGuide } from '../components/user-guide';
import { Copy } from 'lucide-react';
import type { LinkJson } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermissions();
  const { checkAuth } = useAuth();
  const [links, setLinks] = useState<LinkJson[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignJson[]>([]);
  const [overviewClicks, setOverviewClicks] = useState<number | null>(null);

  const loadDashboardData = useCallback(async () => {
    const fetches: Promise<void>[] = [
      apiRequest<{ links: LinkJson[] }>('/api/v1/links')
        .then((data) => setLinks(data.links))
        .catch(() => setLinks([])),
    ];
    if (can.analytics) {
      fetches.push(
        getAnalyticsOverview()
          .then((overview) => setOverviewClicks(overview.totalClicks))
          .catch(() => setOverviewClicks(null)),
      );
    }
    if (can.readCampaigns) {
      fetches.push(
        listCampaigns()
          .then((data) => setCampaigns(data))
          .catch(() => setCampaigns([])),
      );
    }
    await Promise.all(fetches);
  }, [can.analytics, can.readCampaigns]);

  useLiveRefresh(loadDashboardData, {
    intervalMs: ANALYTICS_POLL_INTERVAL_MS,
    enabled: can.readLinks,
  });

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return;
    void (async () => {
      await checkAuth();
      toast.success('Subscription updated! Your plan is now active.');
      setSearchParams({}, { replace: true });
    })();
  }, [searchParams, setSearchParams, checkAuth]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.startsWith('http') ? text : `https://${text}`);
    toast.success('Copied to clipboard');
  };

  const totalLinks = links.length;

  return (
    <FeatureGate allowed={can.readLinks} featureName="Dashboard">
    <AppLayout>
      <UserGuide />
      <div className="w-full overflow-x-hidden min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        {/* Shorten Links Section - Narrow Container */}
        <div className="max-w-2xl mx-auto px-4 py-6 w-full mt-[20px] mb-[0px] relative">
          {/* Title */}
          <h1 className="mb-2 text-center text-[32px]">
            <span>Make </span>
            <span className="text-primary">Every NFC Tap</span>
            <span> Measurable</span>
          </h1>
          <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground mb-6 text-center">
            The link management platform built for NFC-powered products & campaigns
          </p>

          {/* Link Shortener Form */}
          <div id="link-creator-form" className="bg-card/50 backdrop-blur-md rounded-lg p-4 mb-6 w-full bg-[#ffffff00]">
            <LinkCreatorForm
              idPrefix="dashboard"
              onCreated={(link) => setLinks((prev) => [link, ...prev])}
            />
          </div>
        </div>

        {/* Recent Links and Campaigns Section - Full Width Container */}
        <div className="w-full px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-12 w-full">
              {(can.analytics && overviewClicks !== null) || can.readCampaigns || links.length > 0 ? (
                <div
                  className={`grid grid-cols-1 gap-4 ${
                    can.analytics && can.readCampaigns
                      ? 'sm:grid-cols-3'
                      : can.analytics || can.readCampaigns
                        ? 'sm:grid-cols-2'
                        : 'sm:grid-cols-1'
                  }`}
                >
                  {can.analytics && overviewClicks !== null && (
                    <div className="bg-card/50 backdrop-blur-md rounded-lg p-4 text-center shadow-lg">
                      <p className="text-3xl font-bold">{overviewClicks.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total clicks</p>
                    </div>
                  )}
                  <div className="bg-card/50 backdrop-blur-md rounded-lg p-4 text-center shadow-lg">
                    <p className="text-3xl font-bold">{links.length}</p>
                    <p className="text-sm text-muted-foreground">Recent links loaded</p>
                  </div>
                  {can.readCampaigns && (
                    <div className="bg-card/50 backdrop-blur-md rounded-lg p-4 text-center shadow-lg">
                      <p className="text-3xl font-bold">{campaigns.length}</p>
                      <p className="text-sm text-muted-foreground">Recent campaigns loaded</p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Recent Links */}
              <div id="recent-links-section" className="w-full">
                <div className="flex flex-col items-center mb-6 gap-2">
                  <h2 className="text-center text-[32px]">Recent Links</h2>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/links')}
                    className="text-xs px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    View All
                  </Button>
                </div>

                {/* Grid Layout for Desktop, Stack for Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {links.slice(0, 2).map((link) => (
                    <div
                      key={link.id}
                      onClick={() => navigate(`/links/${link.id}`)}
                      className="bg-card/50 backdrop-blur-md rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-shadow"
                    >
                      {/* Link Name at top */}
                      <h3 className="font-semibold mb-2 text-center text-[20px]">{link.name}</h3>

                      {/* Short URL with copy button */}
                      <div className="flex items-center justify-center gap-1.5 mb-1 min-w-0">
                        <span className="font-medium text-sm truncate text-primary">
                          {displayShortUrl(link)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(displayShortUrl(link));
                          }}
                          className="p-1 hover:bg-muted rounded shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Original URL */}
                      <p className="text-xs text-muted-foreground truncate mb-3 text-center">
                        {link.originalUrl}
                      </p>

                      {/* Clicks - own row */}
                      <div className="bg-muted/30 rounded p-2 text-center">
                        <p className="text-2xl leading-none mb-1">{link.clicks.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {can.readCampaigns && (
              <div id="recent-campaigns-section" className="w-full">
                <div className="flex flex-col items-center mb-6 gap-2">
                  <h2 className="text-center text-[32px]">Recent Campaigns</h2>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/campaigns')}
                    className="text-xs px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    View All
                  </Button>
                </div>

                {/* Grid Layout for Desktop, Stack for Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div
                      key={campaign.id}
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="bg-card/50 backdrop-blur-md rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-shadow"
                    >
                      {/* Campaign Name at top */}
                      <h3 className="font-semibold mb-2 text-center text-[20px]">{campaign.name}</h3>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mb-3 text-center">
                        {campaign.description}
                      </p>

                      {/* Clicks - own row */}
                      <div className="bg-muted/30 rounded p-2 text-center">
                        <p className="text-2xl leading-none mb-1">{campaign.totalClicks.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
    </FeatureGate>
  );
}