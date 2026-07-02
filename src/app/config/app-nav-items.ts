import {
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

export type AppNavPlacement = 'primary' | 'overflow';

export type AppNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  show: (ctx: AppNavContext) => boolean;
  placement: AppNavPlacement;
  showOnMobileTab: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    path: '/links',
    label: 'Links',
    icon: LinkIcon,
    show: ({ permissions }) => permissions.links.read,
    placement: 'primary',
    showOnMobileTab: true,
  },
  {
    path: '/dashboard',
    label: 'Analytics',
    icon: BarChart3,
    show: ({ permissions }) => permissions.analytics.read,
    placement: 'primary',
    showOnMobileTab: true,
  },
  {
    path: '/campaigns',
    label: 'Campaigns',
    icon: FolderKanban,
    show: ({ permissions }) => permissions.campaigns.read,
    placement: 'primary',
    showOnMobileTab: true,
  },
  {
    path: '/team',
    label: 'Team',
    icon: Users,
    show: ({ permissions }) => permissions.team.read,
    placement: 'primary',
    showOnMobileTab: true,
  },
  {
    path: '/workspaces',
    label: 'Workspaces',
    icon: Briefcase,
    show: ({ permissions }) => permissions.workspaces.read,
    placement: 'overflow',
    showOnMobileTab: false,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    show: () => true,
    placement: 'overflow',
    showOnMobileTab: false,
  },
  {
    path: '/admin/overview',
    label: 'Admin',
    icon: Shield,
    show: ({ platformAdmin }) => platformAdmin,
    placement: 'overflow',
    showOnMobileTab: false,
  },
];

export function getVisibleNavItems(ctx: AppNavContext): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.show(ctx));
}

export function getPrimaryNavItems(ctx: AppNavContext): AppNavItem[] {
  return getVisibleNavItems(ctx).filter((item) => item.placement === 'primary');
}

export function getOverflowNavItems(ctx: AppNavContext): AppNavItem[] {
  return getVisibleNavItems(ctx).filter((item) => item.placement === 'overflow');
}

export function getDesktopSidebarNavItems(ctx: AppNavContext): AppNavItem[] {
  return getPrimaryNavItems(ctx);
}

export function getDesktopSidebarFooterItems(ctx: AppNavContext): AppNavItem[] {
  return getOverflowNavItems(ctx);
}

export function getMobileTabNavItems(ctx: AppNavContext): AppNavItem[] {
  return getVisibleNavItems(ctx).filter((item) => item.showOnMobileTab);
}

export function getMobileMoreNavItems(ctx: AppNavContext): AppNavItem[] {
  return getOverflowNavItems(ctx);
}
