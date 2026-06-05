import { Badge } from '../ui/badge';
import type { SubscriptionTier } from '@/types';

const tierColors: Record<SubscriptionTier, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'bg-blue-500/10 text-blue-500',
  growth: 'bg-emerald-500/10 text-emerald-500',
  enterprise: 'bg-purple-500/10 text-purple-500',
};

export function AdminTierBadge({ tier }: { tier: SubscriptionTier | string }) {
  const key = tier as SubscriptionTier;
  return (
    <Badge variant="secondary" className={tierColors[key] ?? tierColors.free}>
      {tier}
    </Badge>
  );
}
