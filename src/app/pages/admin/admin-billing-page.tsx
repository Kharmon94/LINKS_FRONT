import { CreditCard } from 'lucide-react';
import { AdminPlaceholder } from '../../components/admin/admin-placeholder';

export function AdminBillingPage() {
  return (
    <AdminPlaceholder
      title="Billing admin"
      description="Stripe customer management, subscription status, and MRR reporting will live here."
      icon={<CreditCard className="w-6 h-6 text-muted-foreground" />}
      breadcrumbs={[
        { label: 'Admin', href: '/admin/overview' },
        { label: 'Billing' },
      ]}
      items={[
        'Stripe customer lookup by user',
        'Subscription status and tier history',
        'Monthly recurring revenue dashboard',
        'Refund and credit note tools',
      ]}
    />
  );
}
