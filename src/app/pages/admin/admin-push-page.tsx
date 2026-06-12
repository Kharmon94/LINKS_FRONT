import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BellRing, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAdminPushSubscription, fetchAdminPushSubscriptions } from '@/services/admin-api';
import type { AdminPushSubscriptionRow, PaginationMeta } from '@/types';
import { useAdminQuery } from '@/app/hooks/use-admin-query';
import { AdminSearchInput } from '../../components/admin/admin-search-input';
import { AdminPagination } from '../../components/admin/admin-pagination';
import { AdminConfirmDialog } from '../../components/admin/admin-confirm-dialog';
import { AdminTableSkeleton, AdminEmptyState, AdminErrorState } from '../../components/admin/admin-page-states';
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

export function AdminPushPage() {
  const { q, page, setQuery, apiParams } = useAdminQuery();
  const [rows, setRows] = useState<AdminPushSubscriptionRow[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, perPage: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPushSubscriptions(apiParams);
      setRows(data.webPushSubscriptions);
      setMeta(data.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load push subscriptions');
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
      await deleteAdminPushSubscription(deleteId);
      setRows((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success('Push subscription removed');
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
          <BreadcrumbItem><BreadcrumbPage>Web push</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-semibold">Web push</h1>
        <p className="text-muted-foreground text-sm">Push subscription oversight</p>
      </div>

      <AdminSearchInput value={q} onChange={(v) => setQuery({ q: v })} placeholder="Search by user email…" />

      {error && <AdminErrorState message={error} onRetry={load} />}

      {loading ? (
        <AdminTableSkeleton />
      ) : rows.length === 0 ? (
        <AdminEmptyState icon={BellRing} title="No subscriptions found" description="Adjust search or check back later." />
      ) : (
        <>
          <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link to={`/admin/users/${row.userId}`} className="hover:underline text-sm">{row.userEmail}</Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.endpointPreview}</TableCell>
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
        title="Remove push subscription?"
        description="The user will stop receiving web push notifications on this device."
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
