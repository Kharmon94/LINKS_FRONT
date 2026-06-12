import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate, RequirePermission } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaign,
} from '@/services/campaigns-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function CampaignFormPage() {
  const { campaignId } = useParams();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.pathname === '/campaigns/new';

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      try {
        const campaign = await getCampaign(campaignId!);
        if (!cancelled) {
          setFormData({ name: campaign.name, description: campaign.description });
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : 'Failed to load campaign');
          navigate('/campaigns');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId, isNew, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await createCampaign(formData);
        toast.success('Campaign created');
      } else {
        await updateCampaign(campaignId!, formData);
        toast.success('Campaign updated');
      }
      navigate('/campaigns');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;
    try {
      await deleteCampaign(campaignId!);
      toast.success('Campaign deleted');
      navigate('/campaigns');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete campaign');
    }
  };

  const gateAllowed = isNew ? can.createCampaigns : can.readCampaigns;

  return (
    <FeatureGate allowed={gateAllowed} featureName="Campaigns">
      <RequirePermission allowed={isNew ? can.createCampaigns : can.readCampaigns}>
        <AppLayout>
          <div className="min-h-screen bg-background relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

            <div className="px-4 py-8 max-w-2xl mx-auto relative">
              <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate('/campaigns')} className="mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Campaigns
                </Button>

                <h1 className="text-[32px] text-center mb-2">
                  {isNew ? 'Create Campaign' : 'Edit Campaign'}
                </h1>
                <p className="text-muted-foreground text-center">
                  {isNew
                    ? 'Create a new campaign to organize your links'
                    : 'Update your campaign details'}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-card/50 backdrop-blur-md border border-border/30 rounded-lg p-6 shadow-lg space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Campaign Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Spring Sale 2026"
                        className="h-12 rounded-full bg-background/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description (Optional)
                      </Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add a description for this campaign..."
                        className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-border/30 bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-full" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : isNew ? 'Create Campaign' : 'Save Changes'}
                  </Button>
                </form>
              )}

              {!isNew && can.destroyCampaigns && (
                <div className="mt-12 pt-8 border-t border-border/30">
                  <div className="bg-destructive/10 backdrop-blur-md border border-destructive/30 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete a campaign, there is no going back. Please be certain.
                    </p>
                    <Button type="button" variant="destructive" onClick={handleDelete} className="rounded-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Campaign
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AppLayout>
      </RequirePermission>
    </FeatureGate>
  );
}
