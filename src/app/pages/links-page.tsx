import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { FeatureGate } from '../components/feature-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { apiRequest } from '@/services/api';

interface Link {
  id: string;
  name: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  campaign?: string;
  createdAt: string;
  isRandomizer: boolean;
}

export function LinksPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ links: Link[] }>('/api/v1/links');
        if (!cancelled) setLinks(data.links);
      } catch {
        if (!cancelled) setLinks([]);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredLinks = links.filter((link) =>
    (link.shortUrl || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (link.campaign || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      await apiRequest(`/api/v1/links/${id}`, { method: 'DELETE' });
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch {
      alert('Could not delete link');
    }
  };

  return (
    <FeatureGate allowed={can.readLinks} featureName="Links">
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="px-4 py-6 md:py-8 max-w-7xl mx-auto relative">
          {/* Header */}
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

          {/* Actions Bar */}
          <div className="flex flex-col gap-3 md:gap-4 mb-6">
            {/* Search Input - Full Width with Pill Shape and Filter Icon */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-11 h-12 rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
                aria-label="Filter"
              >
                <Filter className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            
          </div>

          {/* Links Table */}
          <div className="bg-card/50 backdrop-blur-md rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border/30">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Short Link
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Destination
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Campaign
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">
                      Clicks
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => (
                    <tr 
                      key={link.id}
                      onClick={() => navigate(`/links/${link.id}`)}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium">
                          {link.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">
                            {link.shortUrl}
                          </span>
                          {link.isRandomizer && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Randomizer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {link.originalUrl}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {link.campaign || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium">
                          {link.clicks.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-border/30">
              {filteredLinks.map((link) => (
                <div 
                  key={link.id} 
                  onClick={() => navigate(`/links/${link.id}`)}
                  className="p-4 space-y-2 cursor-pointer hover:bg-muted/30 transition-colors active:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1 text-base">
                        {link.name}
                      </div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-primary break-all text-sm">
                          {link.shortUrl}
                        </span>
                        {link.isRandomizer && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded whitespace-nowrap">
                            Randomizer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground break-all line-clamp-1">
                        {link.originalUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1">
                    <div className="flex flex-col gap-0.5">
                      <div>
                        <span className="text-xs text-muted-foreground">Campaign: </span>
                        <span className="text-xs">{link.campaign || 'None'}</span>
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

          {filteredLinks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No links found</p>
              <Button onClick={() => navigate('/dashboard')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
    </FeatureGate>
  );
}