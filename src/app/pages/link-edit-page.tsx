import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
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
import { getLink, updateLink, deleteLink, shortLinkHost } from '@/services/links-api';
import { listCampaigns, type CampaignJson } from '@/services/campaigns-api';
import { listDomains, type CustomDomainJson } from '@/services/domains-api';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';
import { usePublicIdRedirect } from '@/hooks/use-public-id-redirect';
import { linkPath } from '@/lib/resource-paths';
import type { LinkJson } from '@/types';
import { Slider } from '../components/ui/slider';
import {
  evenSplitWeights,
  maxForEntry,
  normalizeWeightsTo100,
  rebalanceWeights,
} from '@/lib/pool-weights';

interface PoolEntry {
  id: string;
  url: string;
  weight: number;
}

export function LinkEditPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [linkData, setLinkData] = useState({
    shortUrl: '',
    fullShortUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignJson[]>([]);
  const [campaignId, setCampaignId] = useState('');
  const [loadedLink, setLoadedLink] = useState<LinkJson | null>(null);

  usePublicIdRedirect('linkId', loadedLink, linkPath);

  const [isRandomizer, setIsRandomizer] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);

  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');

  const [isUtmOpen, setIsUtmOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(true);
  const [isLinkTypeOpen, setIsLinkTypeOpen] = useState(true);

  const [availableDomains, setAvailableDomains] = useState<CustomDomainJson[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [shortCode, setShortCode] = useState('');
  const platformHost = shortLinkHost();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [link, campaignList] = await Promise.all([
          getLink(linkId!),
          can.readCampaigns ? listCampaigns() : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setLoadedLink(link);
        setLinkData({ shortUrl: link.shortUrl, fullShortUrl: link.fullShortUrl || `https://${link.shortUrl}` });
        setLinkName(link.name);
        setDestinationUrl(link.originalUrl);
        setShortCode(link.shortCode);
        setSelectedDomainId(link.customDomainId || '');
        setIsRandomizer(link.isRandomizer ?? false);
        setCampaignId(link.campaignId || '');
        setCampaigns(campaignList);
        setUtmSource(link.utmParams?.source || '');
        setUtmMedium(link.utmParams?.medium || '');
        setUtmCampaign(link.utmParams?.campaign || '');
        setUtmTerm(link.utmParams?.term || '');
        setUtmContent(link.utmParams?.content || '');
        const entries = (link.poolEntries || []).map((e) => ({
          id: e.id,
          url: e.url,
          weight: e.weight,
        }));
        const weights = entries.map((e) => e.weight);
        const normalized =
          weights.reduce((a, b) => a + b, 0) !== 100
            ? normalizeWeightsTo100(weights)
            : weights;
        setPoolEntries(
          entries.map((e, i) => ({ ...e, weight: normalized[i] }))
        );
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : 'Failed to load link');
          navigate('/links');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [linkId, navigate, can.readCampaigns]);

  useEffect(() => {
    if (!can.domains) {
      setAvailableDomains([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const domains = await listDomains();
        if (!cancelled) {
          const verified = domains.filter((d) => d.status === 'verified');
          setAvailableDomains(verified);
          setSelectedDomainId((current) => {
            if (current !== '') return current;
            const defaultDomain = verified.find((d) => d.isDefault);
            return defaultDomain ? defaultDomain.id : '';
          });
        }
      } catch {
        if (!cancelled) setAvailableDomains([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [can.domains]);

  const domainOptions: CustomDomainJson[] = useMemo(() => {
    const platformOption: CustomDomainJson = {
      id: '',
      domain: platformHost,
      status: 'verified',
      isDefault: false,
      createdAt: '',
    };
    return [platformOption, ...availableDomains];
  }, [availableDomains, platformHost]);

  const selectedDomainHost =
    domainOptions.find((d) => d.id === selectedDomainId)?.domain ?? platformHost;

  const previewShortUrl = `${selectedDomainHost}/${shortCode}`;
  const previewFullShortUrl = `https://${previewShortUrl}`;
  const editShortUrlPreview = can.domains ? previewShortUrl : linkData.shortUrl;
  const editFullShortUrlPreview = can.domains ? previewFullShortUrl : linkData.fullShortUrl;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.startsWith('http') ? text : `https://${text}`);
    toast.success('Copied to clipboard');
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateLink(linkId!, {
        name: linkName,
        link_type: isRandomizer ? 'randomizer' : 'single',
        destination_url: isRandomizer ? undefined : destinationUrl,
        campaign_id: campaignId || null,
        ...(can.domains ? { custom_domain_id: selectedDomainId || null } : {}),
        utm_source: utmSource || undefined,
        utm_medium: utmMedium || undefined,
        utm_campaign: utmCampaign || undefined,
        utm_term: utmTerm || undefined,
        utm_content: utmContent || undefined,
        pool_entries_attributes: isRandomizer
          ? poolEntries.map((entry, index) => ({
              id: entry.id.match(/^\d+$/) ? entry.id : undefined,
              destination_url: entry.url,
              weight: entry.weight || 1,
              position: index,
            }))
          : undefined,
      });
      toast.success('Link updated');
      navigate(linkPath(updated));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save link');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) return;
    try {
      await deleteLink(linkId!);
      toast.success('Link deleted');
      navigate('/links');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete link');
    }
  };

  const addPoolEntry = () => {
    const newEntries = [
      ...poolEntries,
      { id: Date.now().toString(), url: '', weight: 1 },
    ];
    const weights = evenSplitWeights(newEntries.length);
    setPoolEntries(
      newEntries.map((entry, i) => ({ ...entry, weight: weights[i] }))
    );
  };

  const removePoolEntry = (id: string) => {
    const filtered = poolEntries.filter((entry) => entry.id !== id);
    const weights = evenSplitWeights(filtered.length);
    setPoolEntries(
      filtered.map((entry, i) => ({ ...entry, weight: weights[i] }))
    );
  };

  const updatePoolEntryUrl = (id: string, url: string) => {
    setPoolEntries(
      poolEntries.map((entry) =>
        entry.id === id ? { ...entry, url } : entry
      )
    );
  };

  const handleWeightChange = (index: number, value: number) => {
    const newWeights = rebalanceWeights(
      poolEntries.map((e) => e.weight),
      index,
      value
    );
    setPoolEntries(
      poolEntries.map((entry, i) => ({ ...entry, weight: newWeights[i] }))
    );
  };

  const totalWeight = poolEntries.reduce((sum, entry) => sum + entry.weight, 0);

  if (loading) {
    return (
      <FeatureGate allowed={can.updateLinks} featureName="Link editing">
        <AppLayout>
          <div className="text-center py-24 text-muted-foreground">Loading link...</div>
        </AppLayout>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate allowed={can.updateLinks} featureName="Link editing">
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="px-4 py-8 max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => loadedLink && navigate(linkPath(loadedLink))}
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
                  {editShortUrlPreview}
                </span>
                <button
                  onClick={() => copyToClipboard(editShortUrlPreview)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(editFullShortUrlPreview, '_blank')}
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

          {/* Short Link Domain */}
          {can.domains && (
            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Short Link Domain</h2>
              <div className="space-y-2">
                <Label htmlFor="edit-domain">Domain</Label>
                <select
                  id="edit-domain"
                  value={selectedDomainId}
                  onChange={(e) => setSelectedDomainId(e.target.value)}
                  className="w-full h-11 px-3 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                >
                  {domainOptions.map((domain) => (
                    <option key={domain.id || 'platform'} value={domain.id}>
                      {domain.id ? domain.domain : `${domain.domain} (platform)`}
                      {domain.isDefault ? ' — Default' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Preview: <span className="font-mono text-primary">{previewShortUrl}</span>
                </p>
              </div>
            </div>
          )}

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
                                updatePoolEntryUrl(entry.id, e.target.value)
                              }
                              className="h-10 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                            />
                            <div className="flex items-center gap-3">
                              <Slider
                                min={1}
                                max={maxForEntry(poolEntries.length)}
                                step={1}
                                value={[entry.weight]}
                                onValueChange={([v]) => handleWeightChange(index, v)}
                                className="flex-1"
                              />
                              <span className="w-10 text-right tabular-nums">
                                {entry.weight}%
                              </span>
                              <span className="text-sm text-muted-foreground">
                                of traffic
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
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full h-11 px-3 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
              >
                <option value="">No Campaign</option>
                {campaigns.map((c) => (
                  <option key={c.publicId} value={c.publicId}>
                    {c.name}
                  </option>
                ))}
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
          <Button onClick={handleSave} size="lg" className="w-full rounded-full h-12" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
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
    </FeatureGate>
  );
}