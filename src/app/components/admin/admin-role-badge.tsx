import { Badge } from '../ui/badge';
import type { UserRole } from '@/types';

export function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'owner':
      return 'bg-primary/10 text-primary';
    case 'admin':
      return 'bg-blue-500/10 text-blue-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function AdminRoleBadge({ role }: { role: UserRole | string }) {
  return (
    <Badge variant="secondary" className={getRoleBadgeColor(role)}>
      {role}
    </Badge>
  );
}
