import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export function CampaignFormPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.pathname === '/campaigns/new';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!isNew) {
      // Mock data - replace with API call to Rails backend
      setFormData({
        name: 'Spring Sale 2026',
        description: 'Marketing campaign for spring promotion',
      });
    }
  }, [isNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with actual API call to Rails backend
    console.log('Saving campaign:', formData);
    alert(isNew ? 'Campaign created successfully!' : 'Campaign updated successfully!');
    navigate('/campaigns');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      // TODO: Replace with actual API call to Rails backend
      navigate('/campaigns');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="px-4 py-8 max-w-2xl mx-auto relative">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/campaigns')}
              className="mb-6"
            >
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card/50 backdrop-blur-md border border-border/30 rounded-lg p-6 shadow-lg space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Campaign Name</Label>
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
                <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a description for this campaign..."
                  className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-border/30 bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Save Button */}
            <Button type="submit" className="w-full h-12 rounded-full">
              <Save className="w-4 h-4 mr-2" />
              {isNew ? 'Create Campaign' : 'Save Changes'}
            </Button>
          </form>

          {/* Danger Zone */}
          {!isNew && (
            <div className="mt-12 pt-8 border-t border-border/30">
              <div className="bg-destructive/10 backdrop-blur-md border border-destructive/30 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a campaign, there is no going back. Please be certain.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="rounded-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Campaign
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}