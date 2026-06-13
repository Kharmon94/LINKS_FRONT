import { useState, useEffect, useMemo } from 'react';
import { ApiError } from '@/services/api';
import { createLink, shortLinkHost, displayShortUrl } from '@/services/links-api';
import { listDomains, type CustomDomainJson } from '@/services/domains-api';
import { listCampaigns, type CampaignJson } from '@/services/campaigns-api';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Link as LinkIcon, Target, Plus, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { LinkJson } from '@/types';
import { buildLinkCustomizePayload } from './link-creator-payload';

interface LinkCreatorFormProps {
  onCreated?: (link: LinkJson) => void;
  idPrefix?: string;
}

export function LinkCreatorForm({ onCreated, idPrefix = 'link-creator' }: LinkCreatorFormProps) {
  const { can } = usePermissions();
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [randomizerUrls, setRandomizerUrls] = useState<string[]>(['', '']);
  const [randomizerName, setRandomizerName] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [availableDomains, setAvailableDomains] = useState<CustomDomainJson[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignJson[]>([]);
  const platformHost = shortLinkHost();

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
        setSelectedDomainId((current) => {
          if (current !== '') return current;
          const defaultDomain = verified.find((d) => d.isDefault);
          return defaultDomain ? defaultDomain.id : '';
        });
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

  const linkCustomizePayload = () =>
    buildLinkCustomizePayload({
      showCustomSlug,
      selectedCampaignId,
      selectedDomainId,
      customSlug,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    });

  const resetAfterCreate = () => {
    setCustomSlug('');
    setSelectedCampaignId('');
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) return;
    try {
      const link = await createLink({
        destination_url: longUrl,
        name: linkName || 'New Link',
        ...linkCustomizePayload(),
      });
      setGeneratedUrl(displayShortUrl(link));
      setLongUrl('');
      setLinkName('');
      resetAfterCreate();
      toast.success('Link created');
      onCreated?.(link);
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
      const link = await createLink({
        name: randomizerName || 'Randomizer Link',
        link_type: 'randomizer',
        ...linkCustomizePayload(),
        pool_entries_attributes: validUrls.map((url, index) => ({
          destination_url: url,
          weight: 1,
          position: index,
        })),
      });
      setGeneratedUrl(displayShortUrl(link));
      setRandomizerUrls(['', '']);
      setRandomizerName('');
      resetAfterCreate();
      toast.success('Randomizer created');
      onCreated?.(link);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not create randomizer');
    }
  };

  const addRandomizerUrl = () => setRandomizerUrls([...randomizerUrls, '']);

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

  const campaignSelect = (suffix: string) =>
    can.readCampaigns ? (
      <div>
        <label htmlFor={`${idPrefix}-campaign-${suffix}`} className="block font-medium mb-1.5 text-[15px] text-center">
          Campaign (optional)
        </label>
        <select
          id={`${idPrefix}-campaign-${suffix}`}
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none px-4"
        >
          <option value="">No campaign</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>
    ) : null;

  const customizeFields = (suffix: string) => (
    <div className="space-y-3">
      <div>
        <label htmlFor={`${idPrefix}-domain-${suffix}`} className="block text-xs font-medium mb-1.5">
          Select Domain
        </label>
        <select
          id={`${idPrefix}-domain-${suffix}`}
          value={selectedDomainId}
          onChange={(e) => setSelectedDomainId(e.target.value)}
          disabled={!can.domains && domainOptions.length === 1}
          className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none px-4"
        >
          {domainOptions.map((domain) => (
            <option key={domain.id || 'platform'} value={domain.id}>
              {domain.id ? domain.domain : `${domain.domain} (platform)`}
              {domain.isDefault ? ' — Default' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-slug-${suffix}`} className="block text-xs font-medium mb-1.5">
          Customize your link (optional)
        </label>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{selectedDomainHost}/</span>
          <Input
            id={`${idPrefix}-slug-${suffix}`}
            type="text"
            placeholder="my-link"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            className="h-10 text-sm flex-1 min-w-0 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

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
  );

  return (
    <div className="w-full">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="w-full mb-4 grid grid-cols-2 h-auto gap-2 p-2 bg-muted/50 dark:bg-muted/20">
          <TabsTrigger
            value="single"
            className="py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
          >
            Single Link
          </TabsTrigger>
          <TabsTrigger
            value="randomizer"
            className="py-3 rounded-full data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
          >
            Randomizer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <form onSubmit={handleCreateLink} className="space-y-3">
            <div>
              <label htmlFor={`${idPrefix}-long-url`} className="block font-medium mb-1.5 text-[15px] text-center">
                Destination URL
              </label>
              <Input
                id={`${idPrefix}-long-url`}
                type="url"
                placeholder="https://example.com/your-long-url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
                className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor={`${idPrefix}-link-name`} className="block font-medium mb-1.5 text-[15px] text-center">
                Link Name (optional)
              </label>
              <Input
                id={`${idPrefix}-link-name`}
                type="text"
                placeholder="My Link"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                className="h-10 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
              />
            </div>

            {campaignSelect('single')}
            {showCustomSlug && customizeFields('single')}

            <Button
              type="submit"
              className="w-full h-10 text-sm rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Shorten Link
            </Button>

            <button
              type="button"
              onClick={() => setShowCustomSlug(!showCustomSlug)}
              className="w-full text-sm text-center text-muted-foreground hover:text-foreground underline"
            >
              {showCustomSlug ? 'Hide customization' : 'Customize'}
            </button>
          </form>
        </TabsContent>

        <TabsContent value="randomizer">
          <form onSubmit={handleCreateRandomizer} className="space-y-3">
            <div>
              <label htmlFor={`${idPrefix}-randomizer-name`} className="block font-medium mb-1.5 text-[15px] text-center">
                Randomizer Name
              </label>
              <Input
                id={`${idPrefix}-randomizer-name`}
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
              <Button type="button" variant="outline" size="sm" onClick={addRandomizerUrl} className="w-full rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add URL
              </Button>
            </div>

            {campaignSelect('randomizer')}
            {showCustomSlug && customizeFields('randomizer')}

            <Button
              type="submit"
              className="w-full h-10 text-sm rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            >
              <Target className="w-4 h-4 mr-2" />
              Create Randomizer
            </Button>

            <button
              type="button"
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
            <code className="flex-1 text-primary font-medium text-xs break-all min-w-0">{generatedUrl}</code>
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
  );
}
