import {
  LayoutDashboard,
  Link as LinkIcon,
  FolderKanban,
  BarChart3,
  Users,
  Briefcase,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import type { UserPermissions } from '@/types';

export type AppNavContext = {
  permissions: UserPermissions;
  platformAdmin: boolean;
};

export type AppNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  show: (ctx: AppNavContext) => boolean;
};

/** Product nav order: Campaigns directly above Analytics. */
export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    show: ({ permissions }) => permissions.links.read,
  },
  {
    path: '/links',
    label: 'Links',
    icon: LinkIcon,
    show: ({ permissions }) => permissions.links.read,
  },
  {
    path: '/campaigns',
    label: 'Campaigns',
    icon: FolderKanban,
    show: ({ permissions }) => permissions.campaigns.read,
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    show: ({ permissions }) => permissions.analytics.read,
  },
  {
    path: '/team',
    label: 'Team',
    icon: Users,
    show: ({ permissions }) => permissions.team.read,
  },
  {
    path: '/workspaces',
    label: 'Workspaces',
    icon: Briefcase,
    show: ({ permissions }) => permissions.workspaces.read,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    show: () => true,
  },
  {
    path: '/admin/overview',
    label: 'Admin',
    icon: Shield,
    show: ({ platformAdmin }) => platformAdmin,
  },
];

export function getVisibleNavItems(ctx: AppNavContext): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.show(ctx));
}
