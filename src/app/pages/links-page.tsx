import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Plus, Search, Filter, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CardListSkeleton } from '../components/page-states';
import { listLinks, deleteLink, displayShortUrl } from '@/services/links-api';
import { listCampaigns, type CampaignJson } from '@/services/campaigns-api';
import type { LinkJson, LinksListMeta } from '@/types';

export function LinksPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [links, setLinks] = useState<LinkJson[]>([]);
  const [meta, setMeta] = useState<LinksListMeta | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [linkTypeFilter, setLinkTypeFilter] = useState<'all' | 'single' | 'randomizer'>('all');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignJson[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, linkTypeFilter, campaignFilter]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listCampaigns();
        if (!cancelled) setCampaigns(data);
      } catch {
        /* campaigns optional for filter */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadLinks = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await listLinks({
        q: debouncedQuery || undefined,
        link_type: linkTypeFilter === 'all' ? undefined : linkTypeFilter,
        campaign_id: campaignFilter || undefined,
        page,
        per_page: 25,
      });
      setLinks(data.links);
      setMeta(data.meta);
    } catch {
      setLinks([]);
      setMeta(null);
      toast.error('Could not load links');
    } finally {
      setListLoading(false);
    }
  }, [debouncedQuery, linkTypeFilter, campaignFilter, page]);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const totalLinks = meta?.total ?? links.length;
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const randomizerCount = links.filter((link) => link.isRandomizer).length;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.perPage)) : 1;

  const copyToClipboard = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      await deleteLink(id);
      toast.success('Link deleted');
      void loadLinks();
    } catch {
      toast.error('Could not delete link');
    }
  };

  const clearFilters = () => {
    setLinkTypeFilter('all');
    setCampaignFilter('');
    setFilterOpen(false);
  };

  const hasActiveFilters = linkTypeFilter !== 'all' || campaignFilter !== '';

  return (
    <FeatureGate allowed={can.readLinks} featureName="Links">
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        <div className="px-4 py-6 md:py-8 max-w-7xl mx-auto relative">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-center text-[28px] md:text-[32px]">Links</h1>
            <p className="text-muted-foreground text-center text-sm md:text-base mb-4">
              Manage all your shortened links in one place
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-11 h-12 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
              />
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors ${hasActiveFilters ? 'text-primary' : ''}`}
                    aria-label="Filter"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Link type</label>
                    <select
                      value={linkTypeFilter}
                      onChange={(e) => setLinkTypeFilter(e.target.value as typeof linkTypeFilter)}
                      className="w-full rounded-sm border bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All types</option>
                      <option value="single">Single</option>
                      <option value="randomizer">Randomizer</option>
                    </select>
                  </div>
                  {campaigns.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Campaign</label>
                      <select
                        value={campaignFilter}
                        onChange={(e) => setCampaignFilter(e.target.value)}
                        className="w-full rounded-sm border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">All campaigns</option>
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                      Clear filters
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card/50 backdrop-blur-md rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold">{totalLinks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total links</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Clicks (this page)</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold">{randomizerCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Randomizers (this page)</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold">{campaigns.length.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </div>
          </div>

          {listLoading ? (
            <CardListSkeleton rows={6} />
          ) : links.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="mb-2">{hasActiveFilters || debouncedQuery ? 'No links match your filters' : 'No links yet'}</p>
              <p className="text-sm">Create your first link from the dashboard</p>
            </div>
          ) : (
          <>
          <div className="bg-card/50 backdrop-blur-md rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border/30">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Short Link</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Destination</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Campaign</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Clicks</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr
                      key={link.id}
                      onClick={() => navigate(`/links/${link.id}`)}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium">{link.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">{link.shortUrl}</span>
                          {link.isRandomizer && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Randomizer</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{link.originalUrl}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{link.campaign?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium">{link.clicks.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => copyToClipboard(displayShortUrl(link), e)}
                            aria-label="Copy short link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {can.destroyLinks && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDelete(link.id, e)}
                              aria-label="Delete link"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-border/30">
              {links.map((link) => (
                <div
                  key={link.id}
                  onClick={() => navigate(`/links/${link.id}`)}
                  className="p-4 space-y-2 cursor-pointer hover:bg-muted/30 transition-colors active:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1 text-base">{link.name}</div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-primary break-all text-sm">{link.shortUrl}</span>
                        {link.isRandomizer && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded whitespace-nowrap">
                            Randomizer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground break-all line-clamp-1">{link.originalUrl}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => copyToClipboard(displayShortUrl(link), e)}
                        aria-label="Copy short link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {can.destroyLinks && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(link.id, e)}
                          aria-label="Delete link"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1">
                    <div className="flex flex-col gap-0.5">
                      <div>
                        <span className="text-xs text-muted-foreground">Campaign: </span>
                        <span className="text-xs">{link.campaign?.name || 'None'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-base">{link.clicks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">clicks</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </AppLayout>
    </FeatureGate>
  );
}
