import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Globe, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAdminCustomDomain, fetchAdminCustomDomains } from '@/services/admin-api';
import type { AdminCustomDomainRow, PaginationMeta } from '@/types';
import { adminUserPath } from '@/lib/resource-paths';
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

export function AdminDomainsPage() {
  const { q, page, setQuery, apiParams } = useAdminQuery();
  const [rows, setRows] = useState<AdminCustomDomainRow[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, perPage: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCustomDomains(apiParams);
      setRows(data.customDomains);
      setMeta(data.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load domains');
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
      await deleteAdminCustomDomain(deleteId);
      setRows((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success('Domain deleted');
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
          <BreadcrumbItem><BreadcrumbPage>Domains</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-semibold">Custom domains</h1>
        <p className="text-muted-foreground text-sm">Verified and pending custom domains</p>
      </div>

      <AdminSearchInput value={q} onChange={(v) => setQuery({ q: v })} placeholder="Search domain or owner email…" />

      {error && <AdminErrorState message={error} onRetry={load} />}

      {loading ? (
        <AdminTableSkeleton />
      ) : rows.length === 0 ? (
        <AdminEmptyState icon={Globe} title="No domains found" description="Adjust search or check back later." />
      ) : (
        <>
          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">{row.domain}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === 'verified' ? 'default' : 'secondary'}>{row.status}</Badge>
                      {row.isDefault && <Badge variant="outline" className="ml-2">Default</Badge>}
                    </TableCell>
                    <TableCell>
                      <Link to={adminUserPath({ publicId: row.userId })} className="hover:underline text-sm">{row.userEmail}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
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
        title="Delete custom domain?"
        description="This removes the domain record. Links using it are unlinked."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
