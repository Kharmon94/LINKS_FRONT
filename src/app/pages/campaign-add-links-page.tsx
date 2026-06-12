import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import {
  getCampaign,
  assignLinksToCampaign,
  listUnassignedLinks,
  type LinkInCampaign,
} from '@/services/campaigns-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function CampaignAddLinksPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [campaignName, setCampaignName] = useState('');
  const [availableLinks, setAvailableLinks] = useState<LinkInCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [campaign, links] = await Promise.all([
          getCampaign(campaignId!),
          listUnassignedLinks(),
        ]);
        if (!cancelled) {
          setCampaignName(campaign.name);
          setAvailableLinks(links);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : 'Failed to load links');
          navigate(`/campaigns/${campaignId}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId, navigate]);

  const filteredLinks = availableLinks.filter(
    (link) =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLink = (linkId: string) => {
    const next = new Set(selectedLinks);
    if (next.has(linkId)) next.delete(linkId);
    else next.add(linkId);
    setSelectedLinks(next);
  };

  const handleAddLinks = async () => {
    setSaving(true);
    try {
      await assignLinksToCampaign(campaignId!, Array.from(selectedLinks));
      toast.success(`Added ${selectedLinks.size} link(s) to campaign`);
      navigate(`/campaigns/${campaignId}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to assign links');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FeatureGate allowed={can.readCampaigns} featureName="Campaigns">
      <AppLayout>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="max-w-3xl mx-auto px-4 py-8 relative">
            <Button variant="ghost" onClick={() => navigate(`/campaigns/${campaignId}`)} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>

            <div className="text-center mb-8">
              <h1 className="text-[32px] mb-2">Add Links to Campaign</h1>
              <p className="text-muted-foreground">{campaignName}</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading links...</div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search links by name, short URL, or destination..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 rounded-full bg-card/50 backdrop-blur-md border-border/30"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-card/50 backdrop-blur-md border border-border/30 rounded-lg shadow-lg overflow-hidden">
                    {filteredLinks.length > 0 ? (
                      <div className="divide-y divide-border/30">
                        {filteredLinks.map((link) => (
                          <div
                            key={link.id}
                            className="p-5 hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => toggleLink(link.id)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="pt-1">
                                <Checkbox
                                  checked={selectedLinks.has(link.id)}
                                  onCheckedChange={() => toggleLink(link.id)}
                                  className="rounded-sm"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-2">{link.name}</h3>
                                <p className="text-sm font-medium text-primary mb-1 truncate">{link.shortUrl}</p>
                                <p className="text-sm text-muted-foreground truncate">{link.originalUrl}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[24px] font-light">{link.clicks.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">clicks</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-muted-foreground">
                        <p>No unassigned links found.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-md border border-border/30 rounded-lg p-6 shadow-lg sticky bottom-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedLinks.size === 0
                        ? 'No links selected'
                        : `${selectedLinks.size} link${selectedLinks.size === 1 ? '' : 's'} selected`}
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/campaigns/${campaignId}`)}
                        className="flex-1 sm:flex-none rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddLinks}
                        disabled={selectedLinks.size === 0 || saving}
                        className="flex-1 sm:flex-none rounded-full h-11 px-6"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {saving ? 'Adding...' : `Add ${selectedLinks.size > 0 ? `(${selectedLinks.size})` : ''}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </AppLayout>
    </FeatureGate>
  );
}
