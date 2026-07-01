import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Link as LinkIcon, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAdminLink, fetchAdminLinks } from '@/services/admin-api';
import type { AdminLink, PaginationMeta } from '@/types';
import { adminLinkPath, adminUserPath } from '@/lib/resource-paths';
import { useAdminQuery } from '@/app/hooks/use-admin-query';
import { AdminSearchInput } from '../../components/admin/admin-search-input';
import { AdminPagination } from '../../components/admin/admin-pagination';
import { AdminConfirmDialog } from '../../components/admin/admin-confirm-dialog';
import { AdminTableSkeleton, AdminEmptyState, AdminErrorState } from '../../components/admin/admin-page-states';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';

export function AdminLinksPage() {
  const { q, page, userId, setQuery, apiParams } = useAdminQuery();
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, perPage: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminLinks(apiParams);
      setLinks(data.links);
      setMeta(data.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load links');
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAdminLink(deleteId);
      setLinks((prev) => prev.filter((l) => l.id !== deleteId));
      toast.success('Link deleted');
      setDeleteId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/overview">Admin</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Links</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Links</h1>
          <p className="text-muted-foreground text-sm">{meta.total} total links</p>
        </div>
        <AdminSearchInput value={q} onChange={(v) => setQuery({ q: v })} placeholder="Search code, name, URL…" />
      </div>

      {userId && (
        <Badge variant="secondary" className="gap-2">
          Filtered by user
          <button type="button" onClick={() => setQuery({ user_id: '' })}><X className="w-3 h-3" /></button>
        </Badge>
      )}

      {error && <AdminErrorState message={error} onRetry={load} />}

      {loading ? (
        <AdminTableSkeleton />
      ) : links.length === 0 ? (
        <AdminEmptyState icon={LinkIcon} title="No links found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <Link to={adminLinkPath(link)} className="font-mono hover:underline">{link.shortCode}</Link>
                    </TableCell>
                    <TableCell>{link.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={link.originalUrl}>
                      {link.originalUrl}
                    </TableCell>
                    <TableCell>
                      <Link to={adminUserPath({ publicId: link.userId })} className="hover:underline text-sm">{link.userEmail}</Link>
                    </TableCell>
                    <TableCell>{link.clicks}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(link.publicId)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination meta={meta} onPageChange={(p) => setQuery({ page: p })} />
        </>
      )}

      <AdminConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete link?"
        description="This permanently removes the short link. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
