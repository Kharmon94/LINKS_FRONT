import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { apiRequest, ApiError } from '@/services/api';
import { createLink, shortLinkHost } from '@/services/links-api';
import { listDomains, type CustomDomainJson } from '@/services/domains-api';
import { listCampaigns, type CampaignJson } from '@/services/campaigns-api';
import { toast } from 'sonner';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { UserGuide } from '../components/user-guide';
import { 
  Link as LinkIcon, 
  Copy, 
  BarChart3, 
  TrendingUp,
  Folder,
  Target,
  Edit,
  Plus,
  X
} from 'lucide-react';

interface ShortenedLink {
  id: string;
  name: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermissions();
  const { checkAuth } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [linkScrollPosition, setLinkScrollPosition] = useState(0);
  const [campaignScrollPosition, setCampaignScrollPosition] = useState(0);

  // Single link state
  const [linkName, setLinkName] = useState('');

  // Randomizer state
  const [randomizerUrls, setRandomizerUrls] = useState<string[]>(['', '']);
  const [randomizerName, setRandomizerName] = useState('');

  // UTM Parameters state
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');

  // Domain selection state
  const [availableDomains, setAvailableDomains] = useState<CustomDomainJson[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const platformHost = shortLinkHost();

  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignJson[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ links: ShortenedLink[] }>('/api/v1/links');
        if (!cancelled) setLinks(data.links);
      } catch {
        if (!cancelled) setLinks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!can.readCampaigns) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await listCampaigns();
        if (!cancelled) setCampaigns(data);
      } catch {
        if (!cancelled) setCampaigns([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [can.readCampaigns]);

  useEffect(() => {
    if (!can.domains) {
      setAvailableDomains([]);
      setSelectedDomainId('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const domains = await listDomains();
        const verified = domains.filter((d) => d.status === 'verified');
        if (cancelled) return;
        setAvailableDomains(verified);
        const defaultDomain = verified.find((d) => d.isDefault) ?? verified[0];
        setSelectedDomainId(defaultDomain?.id ?? '');
      } catch {
        if (!cancelled) {
          setAvailableDomains([]);
          setSelectedDomainId('');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [can.domains]);

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return;
    void (async () => {
      await checkAuth();
      toast.success('Subscription updated! Your plan is now active.');
      setSearchParams({}, { replace: true });
    })();
  }, [searchParams, setSearchParams, checkAuth]);

  const domainOptions: CustomDomainJson[] =
    availableDomains.length > 0
      ? availableDomains
      : [
          {
            id: '',
            domain: platformHost,
            status: 'verified',
            isDefault: true,
            createdAt: '',
          },
        ];

  const selectedDomainHost =
    domainOptions.find((d) => d.id === selectedDomainId)?.domain ?? platformHost;

  const linkCustomizePayload = () => ({
    ...(selectedDomainId ? { custom_domain_id: selectedDomainId } : {}),
    ...(customSlug.trim() ? { short_code: customSlug.trim() } : {}),
    ...(utmSource.trim() ? { utm_source: utmSource.trim() } : {}),
    ...(utmMedium.trim() ? { utm_medium: utmMedium.trim() } : {}),
    ...(utmCampaign.trim() ? { utm_campaign: utmCampaign.trim() } : {}),
    ...(utmTerm.trim() ? { utm_term: utmTerm.trim() } : {}),
    ...(utmContent.trim() ? { utm_content: utmContent.trim() } : {}),
  });

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) return;
    try {
      const link = await createLink({
        destination_url: longUrl,
        name: linkName || 'New Link',
        ...linkCustomizePayload(),
      });
      setLinks((prev) => [link as ShortenedLink, ...prev]);
      setGeneratedUrl(link.shortUrl);
      setLongUrl('');
      setLinkName('');
      setCustomSlug('');
      toast.success('Link created');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not create link';
      toast.error(msg);
    }
  };

  const handleCreateRandomizer = async (e: React.FormEvent) => {
    e.preventDefault();

    const validUrls = randomizerUrls.filter((url) => url.trim() !== '');

    if (validUrls.length < 2) {
      toast.error('Please add at least 2 destination URLs for the randomizer');
      return;
    }

    try {
      const data = await createLink({
        name: randomizerName || 'Randomizer Link',
        link_type: 'randomizer',
        ...linkCustomizePayload(),
        pool_entries_attributes: validUrls.map((url, index) => ({
          destination_url: url,
          weight: 1,
          position: index,
        })),
      });
      setLinks((prev) => [data as ShortenedLink, ...prev]);
      setGeneratedUrl(data.shortUrl);
      setRandomizerUrls(['', '']);
      setRandomizerName('');
      setCustomSlug('');
      toast.success('Randomizer created');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not create randomizer');
    }
  };

  const addRandomizerUrl = () => {
    setRandomizerUrls([...randomizerUrls, '']);
  };

  const removeRandomizerUrl = (index: number) => {
    if (randomizerUrls.length > 2) {
      setRandomizerUrls(randomizerUrls.filter((_, i) => i !== index));
    }
  };

  const updateRandomizerUrl = (index: number, value: string) => {
    const newUrls = [...randomizerUrls];
    newUrls[index] = value;
    setRandomizerUrls(newUrls);
  };

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
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="w-full mb-4 grid grid-cols-2 h-auto gap-2 p-2 bg-muted/50 dark:bg-muted/20">
                <TabsTrigger value="single" className="py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                  Single Link
                </TabsTrigger>
                <TabsTrigger value="randomizer" className="py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                  Randomizer
                </TabsTrigger>
              </TabsList>

              {/* Single Link Tab */}
              <TabsContent value="single">
                <form onSubmit={handleCreateLink} className="space-y-3">
                  <div>
                    <label htmlFor="long-url" className="block font-medium mb-1.5 text-[15px] text-center">
                      Destination URL
                    </label>
                    <Input
                      id="long-url"
                      type="url"
                      placeholder="https://example.com/your-long-url"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                      required
                      className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="link-name" className="block font-medium mb-1.5 text-[15px] text-center">
                      Link Name (optional)
                    </label>
                    <Input
                      id="link-name"
                      type="text"
                      placeholder="My Link"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                      className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  {showCustomSlug && (
                    <div className="space-y-3">
                      {/* Domain Selector */}
                      <div>
                        <label htmlFor="domain-select" className="block text-xs font-medium mb-1.5">
                          Select Domain
                        </label>
                        <select
                          id="domain-select"
                          value={selectedDomainId}
                          onChange={(e) => setSelectedDomainId(e.target.value)}
                          disabled={!can.domains && domainOptions.length === 1}
                          className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none px-4"
                        >
                          {domainOptions.map((domain) => (
                            <option key={domain.id || domain.domain} value={domain.id}>
                              {domain.domain} {domain.isDefault ? '(Default)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="custom-slug" className="block text-xs font-medium mb-1.5">
                          Customize your link (optional)
                        </label>
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{selectedDomainHost}/</span>
                          <Input
                            id="custom-slug"
                            type="text"
                            placeholder="my-link"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                            className="h-10 text-sm flex-1 min-w-0 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* UTM Parameters */}
                      <div className="pt-3">
                        <p className="text-xs font-medium mb-2">UTM Parameters (optional)</p>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Source (e.g., facebook, newsletter)"
                            value={utmSource}
                            onChange={(e) => setUtmSource(e.target.value)}
                            className="h-9 text-xs rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                          />
                          <Input
                            type="text"
                            placeholder="Medium (e.g., social, email)"
                            value={utmMedium}
                            onChange={(e) => setUtmMedium(e.target.value)}
                            className="h-9 text-xs rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                          />
                          <Input
                            type="text"
                            placeholder="Campaign (e.g., spring_sale)"
                            value={utmCampaign}
                            onChange={(e) => setUtmCampaign(e.target.value)}
                            className="h-9 text-xs rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                          />
                          <Input
                            type="text"
                            placeholder="Term (optional)"
                            value={utmTerm}
                            onChange={(e) => setUtmTerm(e.target.value)}
                            className="h-9 text-xs rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                          />
                          <Input
                            type="text"
                            placeholder="Content (optional)"
                            value={utmContent}
                            onChange={(e) => setUtmContent(e.target.value)}
                            className="h-9 text-xs rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-10 text-sm rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Shorten Link
                  </Button>

                  <button
                    type="button"
                    id="customize-button"
                    onClick={() => setShowCustomSlug(!showCustomSlug)}
                    className="w-full text-sm text-center text-muted-foreground hover:text-foreground underline"
                  >
                    {showCustomSlug ? 'Hide customization' : 'Customize'}
                  </button>
                </form>
              </TabsContent>

              {/* Randomizer Tab */}
              <TabsContent value="randomizer">
                <form onSubmit={handleCreateRandomizer} className="space-y-3">
                  <div>
                    <label htmlFor="randomizer-name" className="block font-medium mb-1.5 text-[15px] text-center">
                      Randomizer Name
                    </label>
                    <Input
                      id="randomizer-name"
                      type="text"
                      placeholder="My Randomizer Link"
                      value={randomizerName}
                      onChange={(e) => setRandomizerName(e.target.value)}
                      className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium mb-1.5 text-[15px] text-center">
                      Destination URLs (minimum 2)
                    </label>
                    {randomizerUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="url"
                          placeholder={`https://example.com/destination-${index + 1}`}
                          value={url}
                          onChange={(e) => updateRandomizerUrl(index, e.target.value)}
                          required
                          className="h-10 text-sm flex-1 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                        />
                        {randomizerUrls.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeRandomizerUrl(index)}
                            className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRandomizerUrl}
                      className="w-full rounded-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </div>

                  {showCustomSlug && (
                    <div>
                      {/* Domain Selector */}
                      <div className="mb-3">
                        <label htmlFor="domain-select-randomizer" className="block text-xs font-medium mb-1.5">
                          Select Domain
                        </label>
                        <select
                          id="domain-select-randomizer"
                          value={selectedDomainId}
                          onChange={(e) => setSelectedDomainId(e.target.value)}
                          disabled={!can.domains && domainOptions.length === 1}
                          className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none px-4"
                        >
                          {domainOptions.map((domain) => (
                            <option key={domain.id || domain.domain} value={domain.id}>
                              {domain.domain} {domain.isDefault ? '(Default)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label htmlFor="custom-slug-randomizer" className="block text-xs font-medium mb-1.5">
                        Customize your link (optional)
                      </label>
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{selectedDomainHost}/</span>
                        <Input
                          id="custom-slug-randomizer"
                          type="text"
                          placeholder="my-randomizer"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value)}
                          className="h-10 text-sm flex-1 min-w-0 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-10 text-sm rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Create Randomizer
                  </Button>

                  <button
                    type="button"
                    id="customize-button"
                    onClick={() => setShowCustomSlug(!showCustomSlug)}
                    className="w-full text-sm text-center text-muted-foreground hover:text-foreground underline"
                  >
                    {showCustomSlug ? 'Hide customization' : 'Customize'}
                  </button>
                </form>
              </TabsContent>
            </Tabs>

            {generatedUrl && (
              <div className="mt-3 p-3 bg-muted/30 rounded-md border border-border w-full">
                <p className="text-xs text-muted-foreground mb-1.5">Your shortened link:</p>
                <div className="flex items-center gap-2 w-full min-w-0">
                  <code className="flex-1 text-primary font-medium text-xs break-all min-w-0">
                    {generatedUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedUrl)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Links and Campaigns Section - Full Width Container */}
        <div className="w-full px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-12 w-full">
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
                          {link.shortUrl}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(link.shortUrl);
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

              {/* Campaign Stats */}
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
    </FeatureGate>
  );
}