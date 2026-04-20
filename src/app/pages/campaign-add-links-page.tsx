import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';

export function CampaignAddLinksPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  // Mock data - replace with API call to Rails backend
  const campaign = {
    id: campaignId,
    name: 'Spring Sale 2026',
  };

  // Mock available links (links not already in this campaign)
  const availableLinks = [
    {
      id: '3',
      name: 'Summer Promo',
      shortUrl: 'blackcollar.io/summer-promo',
      originalUrl: 'https://example.com/summer-sale/promo',
      clicks: 1250,
    },
    {
      id: '4',
      name: 'Fall Campaign',
      shortUrl: 'blackcollar.io/fall-campaign',
      originalUrl: 'https://example.com/fall/campaign',
      clicks: 890,
    },
    {
      id: '5',
      name: 'Product Launch',
      shortUrl: 'blackcollar.io/product-launch',
      originalUrl: 'https://example.com/products/new-launch',
      clicks: 2100,
    },
    {
      id: '6',
      name: 'Holiday Special',
      shortUrl: 'blackcollar.io/holiday-special',
      originalUrl: 'https://example.com/holiday/special-offer',
      clicks: 1550,
    },
    {
      id: '7',
      name: 'Newsletter Link',
      shortUrl: 'blackcollar.io/newsletter',
      originalUrl: 'https://example.com/newsletter/signup',
      clicks: 780,
    },
    {
      id: '8',
      name: 'Social Media',
      shortUrl: 'blackcollar.io/social',
      originalUrl: 'https://example.com/social/links',
      clicks: 3200,
    },
  ];

  const filteredLinks = availableLinks.filter(
    (link) =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLink = (linkId: string) => {
    const newSelected = new Set(selectedLinks);
    if (newSelected.has(linkId)) {
      newSelected.delete(linkId);
    } else {
      newSelected.add(linkId);
    }
    setSelectedLinks(newSelected);
  };

  const handleAddLinks = () => {
    // Here you would make API call to Rails backend to add links to campaign
    console.log('Adding links to campaign:', Array.from(selectedLinks));
    alert(`Added ${selectedLinks.size} link(s) to campaign!`);
    navigate(`/campaigns/${campaignId}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="max-w-3xl mx-auto px-4 py-8 relative">
          {/* Header */}
          <Button
            variant="ghost"
            onClick={() => navigate(`/campaigns/${campaignId}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-[32px] mb-2">Add Links to Campaign</h1>
            <p className="text-muted-foreground">{campaign.name}</p>
          </div>

          {/* Search */}
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

          {/* Links List */}
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
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{link.name}</h3>
                          </div>
                          <p className="text-sm font-medium text-primary mb-1 truncate">
                            {link.shortUrl}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {link.originalUrl}
                          </p>
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
                  <p>No links found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Count and Action Buttons */}
          <div className="bg-card/50 backdrop-blur-md border border-border/30 rounded-lg p-6 shadow-lg sticky bottom-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">
                  {selectedLinks.size === 0
                    ? 'No links selected'
                    : `${selectedLinks.size} link${selectedLinks.size === 1 ? '' : 's'} selected`}
                </p>
              </div>
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
                  disabled={selectedLinks.size === 0}
                  className="flex-1 sm:flex-none rounded-full h-11 px-6"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add {selectedLinks.size > 0 ? `(${selectedLinks.size})` : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
