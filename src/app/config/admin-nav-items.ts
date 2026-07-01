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

export type AdminNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  showOnMobileTab: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard, showOnMobileTab: true },
  { path: '/admin/users', label: 'Users', icon: Users, showOnMobileTab: true },
  { path: '/admin/links', label: 'Links', icon: LinkIcon, showOnMobileTab: true },
  { path: '/admin/campaigns', label: 'Campaigns', icon: Megaphone, showOnMobileTab: false },
  { path: '/admin/workspaces', label: 'Workspaces', icon: FolderKanban, showOnMobileTab: false },
  { path: '/admin/domains', label: 'Domains', icon: Globe, showOnMobileTab: false },
  { path: '/admin/push', label: 'Web push', icon: BellRing, showOnMobileTab: false },
  { path: '/admin/health', label: 'Health', icon: Activity, showOnMobileTab: false },
  { path: '/admin/feature-flags', label: 'Feature Flags', icon: Flag, showOnMobileTab: false },
  { path: '/admin/teams', label: 'Teams', icon: UsersRound, showOnMobileTab: false },
  { path: '/admin/billing', label: 'Billing', icon: CreditCard, showOnMobileTab: false },
];

export function getAdminMobileTabItems(): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => item.showOnMobileTab);
}

export function getAdminOverflowItems(): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => !item.showOnMobileTab);
}
