import { X, Link as LinkIcon, FolderKanban, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface TeamMemberDetailsProps {
  member: TeamMember;
  onClose: () => void;
}

export function TeamMemberDetails({ member, onClose }: TeamMemberDetailsProps) {
  // Mock data - replace with API call to Rails backend
  const memberLinks = [
    { id: '1', shortUrl: 'blackcollar.io/abc123', clicks: 1247, campaign: 'Spring Sale 2026' },
    { id: '2', shortUrl: 'blackcollar.io/promo', clicks: 892, campaign: 'Product Launch' },
    { id: '3', shortUrl: 'blackcollar.io/deal', clicks: 543, campaign: 'Spring Sale 2026' },
  ];

  const memberCampaigns = [
    { id: '1', name: 'Spring Sale 2026', links: 12, totalClicks: 3421 },
    { id: '2', name: 'Product Launch', links: 8, totalClicks: 2156 },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light mb-1">{member.name}</h2>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Links</p>
                </div>
                <p className="text-2xl font-bold">{memberLinks.length}</p>
              </div>

              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FolderKanban className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                </div>
                <p className="text-2xl font-bold">{memberCampaigns.length}</p>
              </div>

              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
                <p className="text-2xl font-bold">
                  {memberLinks.reduce((sum, link) => sum + link.clicks, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Campaigns */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Active Campaigns
              </h3>
              <div className="space-y-2">
                {memberCampaigns.map((campaign) => (
                  <div 
                    key={campaign.id}
                    className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium mb-1">{campaign.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {campaign.links} links • {campaign.totalClicks.toLocaleString()} total clicks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Recent Links
              </h3>
              <div className="space-y-2">
                {memberLinks.map((link) => (
                  <div 
                    key={link.id}
                    className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate mb-1">{link.shortUrl}</p>
                        <p className="text-xs text-muted-foreground">{link.campaign}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{link.clicks.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
