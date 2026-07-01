import {
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  Activity,
  Flag,
  UsersRound,
  CreditCard,
  Megaphone,
  FolderKanban,
  Globe,
  BellRing,
  type LucideIcon,
} from 'lucide-react';

export type AdminNavPlacement = 'primary' | 'overflow';

export type AdminNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  placement: AdminNavPlacement;
  showOnMobileTab: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard, placement: 'primary', showOnMobileTab: true },
  { path: '/admin/users', label: 'Users', icon: Users, placement: 'primary', showOnMobileTab: true },
  { path: '/admin/links', label: 'Links', icon: LinkIcon, placement: 'primary', showOnMobileTab: true },
  { path: '/admin/campaigns', label: 'Campaigns', icon: Megaphone, placement: 'primary', showOnMobileTab: true },
  { path: '/admin/workspaces', label: 'Workspaces', icon: FolderKanban, placement: 'overflow', showOnMobileTab: false },
  { path: '/admin/domains', label: 'Domains', icon: Globe, placement: 'overflow', showOnMobileTab: false },
  { path: '/admin/push', label: 'Web push', icon: BellRing, placement: 'overflow', showOnMobileTab: false },
  { path: '/admin/health', label: 'Health', icon: Activity, placement: 'overflow', showOnMobileTab: false },
  { path: '/admin/feature-flags', label: 'Feature Flags', icon: Flag, placement: 'overflow', showOnMobileTab: false },
  { path: '/admin/teams', label: 'Teams', icon: UsersRound, placement: 'overflow', showOnMobileTab: false },
  { path: '/admin/billing', label: 'Billing', icon: CreditCard, placement: 'overflow', showOnMobileTab: false },
];

export function getPrimaryAdminNavItems(): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => item.placement === 'primary');
}

export function getOverflowAdminNavItems(): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => item.placement === 'overflow');
}

export function getMobileTabAdminNavItems(): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => item.showOnMobileTab);
}
