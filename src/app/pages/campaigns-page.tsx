import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '../contexts/auth-context';
import { useLiveRefresh } from '@/hooks/use-live-refresh';
import { ANALYTICS_POLL_INTERVAL_MS } from '../config/analytics-refresh';
import { Button } from '../components/ui/button';
import { FolderKanban, Plus } from 'lucide-react';
import { listCampaigns, type CampaignJson } from '@/services/campaigns-api';

export function CampaignsPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignJson[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async ({ silent }: { silent: boolean }) => {
    if (!silent) setLoading(true);
    try {
      const data = await listCampaigns();
      setCampaigns(data);
    } catch {
      setCampaigns([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useLiveRefresh(loadCampaigns, {
    intervalMs: ANALYTICS_POLL_INTERVAL_MS,
    enabled: can.readCampaigns,
    reloadKey: user?.activeWorkspaceId,
  });

  return (
    <FeatureGate allowed={can.readCampaigns} featureName="Campaigns">
      <AppLayout>
        <div className="min-h-screen bg-background relative mx-[0px] mt-[20px] mb-[0px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 py-6 relative">
            <div className="mb-6">
              <h1 className="mb-2 text-center text-[32px]">Campaigns</h1>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Organize and track your link campaigns
              </p>
              {can.createCampaigns && (
                <Button
                  onClick={() => navigate('/campaigns/new')}
                  className="h-10 mx-auto flex items-center rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg">
                <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first campaign to organize your links
                </p>
                {can.createCampaigns && (
                  <Button onClick={() => navigate('/campaigns/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-card/50 backdrop-blur-md rounded-lg p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-[#ffffff]"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-light mb-1 truncate text-center text-[20px]">{campaign.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 text-center">
                          {campaign.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Links</p>
                        <p className="text-xl font-bold">{campaign.linksCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Clicks</p>
                        <p className="text-xl font-bold">{campaign.totalClicks.toLocaleString()}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 h-8 text-xs bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:bg-black/90 dark:hover:bg-white/90 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/campaigns/${campaign.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
