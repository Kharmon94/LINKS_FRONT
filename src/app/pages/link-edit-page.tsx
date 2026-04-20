import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft,
  Copy,
  ExternalLink,
  Save,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PoolEntry {
  id: string;
  url: string;
  weight: number;
}

export function LinkEditPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();

  // Mock data - replace with API call to Rails backend
  const [linkData] = useState({
    id: linkId || '1',
    name: 'Spring Campaign Link',
    originalUrl: 'https://www.example.com/marketing-campaign',
    shortCode: 'spring24',
    shortUrl: 'blackcollar.io/spring24',
    clicks: 2891,
    campaign: 'Spring Campaign',
    createdAt: '2026-02-25',
    isRandomizer: false,
  });

  const [isRandomizer, setIsRandomizer] = useState(linkData.isRandomizer);
  const [linkName, setLinkName] = useState(linkData.name);
  const [destinationUrl, setDestinationUrl] = useState(linkData.originalUrl);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([
    { id: '1', url: 'https://www.example.com/option-a', weight: 50 },
    { id: '2', url: 'https://www.example.com/option-b', weight: 50 },
  ]);

  // UTM Parameters state
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');

  // Collapsible sections state
  const [isUtmOpen, setIsUtmOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(true);
  const [isLinkTypeOpen, setIsLinkTypeOpen] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const buildUtmParams = () => {
    const params = new URLSearchParams();
    if (utmSource) params.append('utm_source', utmSource);
    if (utmMedium) params.append('utm_medium', utmMedium);
    if (utmCampaign) params.append('utm_campaign', utmCampaign);
    if (utmTerm) params.append('utm_term', utmTerm);
    if (utmContent) params.append('utm_content', utmContent);
    return params.toString();
  };

  const getPreviewUrl = () => {
    const utmParams = buildUtmParams();
    if (!utmParams) return destinationUrl;
    const separator = destinationUrl.includes('?') ? '&' : '?';
    return `${destinationUrl}${separator}${utmParams}`;
  };

  const handleSave = () => {
    // TODO: Replace with actual API call to Rails backend
    console.log('Saving link:', {
      destinationUrl,
      isRandomizer,
      poolEntries: isRandomizer ? poolEntries : null,
    });
    alert('Link updated successfully!');
    navigate(`/links/${linkId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      // TODO: Replace with actual API call to Rails backend
      navigate('/links');
    }
  };

  const addPoolEntry = () => {
    setPoolEntries([
      ...poolEntries,
      { id: Date.now().toString(), url: '', weight: 0 },
    ]);
  };

  const removePoolEntry = (id: string) => {
    setPoolEntries(poolEntries.filter(entry => entry.id !== id));
  };

  const updatePoolEntry = (id: string, field: 'url' | 'weight', value: string | number) => {
    setPoolEntries(
      poolEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const totalWeight = poolEntries.reduce((sum, entry) => sum + entry.weight, 0);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="px-4 py-8 max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/links/${linkId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Link Details
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="mb-2 text-center md:text-left text-[32px]">Edit Link</h1>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-primary font-medium">
                  {linkData.shortUrl}
                </span>
                <button
                  onClick={() => copyToClipboard(linkData.shortUrl)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(`https://${linkData.shortUrl}`, '_blank')}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Link Name */}
          <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Link Name (Optional)</h2>
            <div className="space-y-2">
              
              <Input
                id="linkName"
                type="text"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="e.g., Spring Campaign Link"
                className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
              />
              <p className="text-xs text-muted-foreground">Give this link a memorable name for easy identification</p>
            </div>
          </div>

          {/* Link Type Toggle */}
          <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg">
            <button
              onClick={() => setIsLinkTypeOpen(!isLinkTypeOpen)}
              className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
            >
              <h2 className="text-xl font-semibold">Link Destination</h2>
              {isLinkTypeOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {isLinkTypeOpen && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-2 mb-6 p-2 bg-muted/50 dark:bg-muted/20 rounded-full">
                  <button
                    type="button"
                    onClick={() => setIsRandomizer(false)}
                    className={`py-3 rounded-full transition-all ${
                      !isRandomizer
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-foreground'
                    }`}
                  >
                    <div className="font-medium">Single Destination</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRandomizer(true)}
                    className={`py-3 rounded-full transition-all ${
                      isRandomizer
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-foreground'
                    }`}
                  >
                    <div className="font-medium">Randomized Pool</div>
                  </button>
                </div>

                {/* Single Destination */}
                {!isRandomizer && (
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination URL</Label>
                    <Input
                      id="destination"
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="https://example.com/destination"
                      className="h-11 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                )}

                {/* Randomizer Pool */}
                {isRandomizer && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>URL Pool</Label>
                      <span className="text-sm text-muted-foreground">
                        Total weight: {totalWeight}%
                      </span>
                    </div>

                    <div className="space-y-3">
                      {poolEntries.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex-1 space-y-2">
                            <Input
                              type="url"
                              placeholder="https://example.com/option"
                              value={entry.url}
                              onChange={(e) =>
                                updatePoolEntry(entry.id, 'url', e.target.value)
                              }
                              className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Weight %"
                                value={entry.weight}
                                onChange={(e) =>
                                  updatePoolEntry(entry.id, 'weight', parseInt(e.target.value) || 0)
                                }
                                min="0"
                                max="100"
                                className="h-10 w-24 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                              />
                              <span className="text-sm text-muted-foreground">
                                % of traffic
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePoolEntry(entry.id)}
                            disabled={poolEntries.length <= 2}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={addPoolEntry}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add URL to Pool
                    </Button>

                    {totalWeight !== 100 && (
                      <p className="text-sm text-amber-500">
                        ⚠️ Total weight should equal 100%
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campaign Assignment */}
          <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg">
            <button
              onClick={() => setIsCampaignOpen(!isCampaignOpen)}
              className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
            >
              <h2 className="text-xl font-semibold">Campaign</h2>
              {isCampaignOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {isCampaignOpen && (
              <div className="px-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="campaign">Assign to Campaign (Optional)</Label>
              <select
                id="campaign"
                className="w-full h-11 px-3 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
              >
                <option value="">No Campaign</option>
                <option value="1">Summer Sale</option>
                <option value="2">Product Launch</option>
                <option value="3">Spring Campaign</option>
              </select>
            </div>
          </div>
            )}
          </div>

          {/* UTM Parameters */}
          <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg">
            <button
              onClick={() => setIsUtmOpen(!isUtmOpen)}
              className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1 text-left">UTM Parameters (Optional)</h2>
                <p className="text-sm text-muted-foreground text-left">
                  Add tracking parameters to your destination URL
                </p>
              </div>
              {isUtmOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
            </button>
            
            {isUtmOpen && (
              <div className="px-6 pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="utmSource">Source</Label>
                <Input
                  id="utmSource"
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="e.g., google, newsletter, facebook"
                  className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                />
                <p className="text-xs text-muted-foreground">Identify the source of your traffic</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmMedium">Medium</Label>
                <Input
                  id="utmMedium"
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="e.g., cpc, email, social"
                  className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                />
                <p className="text-xs text-muted-foreground">Identify the marketing medium</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmCampaign">Campaign</Label>
                <Input
                  id="utmCampaign"
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="e.g., spring_sale, product_launch"
                  className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                />
                <p className="text-xs text-muted-foreground">Identify the specific campaign</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmTerm">Term (Optional)</Label>
                <Input
                  id="utmTerm"
                  type="text"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  placeholder="e.g., running+shoes"
                  className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                />
                <p className="text-xs text-muted-foreground">Identify paid search keywords</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmContent">Content (Optional)</Label>
                <Input
                  id="utmContent"
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="e.g., logolink, textlink"
                  className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                />
                <p className="text-xs text-muted-foreground">Differentiate similar content or links</p>
              </div>

              {buildUtmParams() && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label>Preview URL with UTM Parameters</Label>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-mono break-all">{getPreviewUrl()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
            )}
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} size="lg" className="w-full rounded-full h-12">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>

          {/* Danger Zone */}
          <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-destructive mb-1">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">
                Once you delete a link, there is no going back. Please be certain.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              size="lg"
              className="w-full rounded-full h-12"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Link Permanently
            </Button>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}