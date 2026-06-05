import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAdminLink, fetchAdminLink } from '@/services/admin-api';
import type { AdminLink } from '@/types';
import { AdminConfirmDialog } from '../../components/admin/admin-confirm-dialog';
import { AdminCardSkeleton, AdminErrorState } from '../../components/admin/admin-page-states';
import { Button } from '../../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';

export function AdminLinkDetailPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<AdminLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!linkId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminLink(linkId);
      setLink(data.link);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load link');
    } finally {
      setLoading(false);
    }
  }, [linkId]);

  useEffect(() => {
    void load();
  }, [load]);

  const copyUrl = () => {
    if (!link) return;
    void navigator.clipboard.writeText(link.shortUrl);
    toast.success('Short URL copied');
  };

  const handleDelete = async () => {
    if (!linkId) return;
    setDeleting(true);
    try {
      await deleteAdminLink(linkId);
      toast.success('Link deleted');
      navigate('/admin/links');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <AdminCardSkeleton />;
  if (error || !link) return <AdminErrorState message={error ?? 'Link not found'} onRetry={load} />;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/links">Links</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{link.shortCode}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/links')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Back to links
      </Button>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Short URL</p>
            <div className="flex items-center gap-2">
              <a href={link.shortUrl} target="_blank" rel="noreferrer" className="text-xl font-mono hover:underline">
                {link.shortUrl}
              </a>
              <Button variant="outline" size="icon" onClick={copyUrl}><Copy className="w-4 h-4" /></Button>
            </div>
          </div>
          <Button asChild variant="outline">
            <a href={link.shortUrl} target="_blank" rel="noreferrer">
              Open <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Destination</p>
          <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
            {link.originalUrl}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6 space-y-3">
          <h2 className="font-semibold">Metadata</h2>
          <dl className="text-sm space-y-2">
            <div><dt className="text-muted-foreground">Name</dt><dd>{link.name}</dd></div>
            <div><dt className="text-muted-foreground">Short code</dt><dd className="font-mono">{link.shortCode}</dd></div>
            <div><dt className="text-muted-foreground">Clicks</dt><dd>{link.clicks}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd>{link.createdAt ? new Date(link.createdAt).toLocaleString() : '—'}</dd></div>
          </dl>
        </div>

        <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-6 space-y-3">
          <h2 className="font-semibold">Owner</h2>
          <Link to={`/admin/users/${link.userId}`} className="block hover:underline">{link.userEmail}</Link>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-lg border border-destructive/30 p-6">
        <h2 className="font-semibold text-destructive mb-2">Danger zone</h2>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete this link.</p>
        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="w-4 h-4 mr-2" />Delete link
        </Button>
      </div>

      <AdminConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete link?"
        description={`Delete ${link.shortCode}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
