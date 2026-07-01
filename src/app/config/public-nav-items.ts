import {
  Home,
  Tag,
  LogIn,
  Package,
  Lightbulb,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

export type PublicNavLink = {
  label: string;
  href: string;
};

export type PublicOverflowNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
};

export type PublicLandingNavItem = PublicNavLink & {
  icon: LucideIcon;
  mobilePlacement: 'tab' | 'overflow';
};

export type PublicMobileTab = {
  label: string;
  path: string;
  icon: LucideIcon;
  external?: boolean;
};

export const DEFAULT_PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '#' },
];

/** Single source of truth for landing desktop + mobile public navigation. */
export const LANDING_PUBLIC_NAV_ITEMS: PublicLandingNavItem[] = [
  {
    label: 'Products',
    href: 'https://www.blackcollar.io',
    icon: Package,
    mobilePlacement: 'overflow',
  },
  {
    label: 'Use Cases',
    href: '/use-cases',
    icon: Lightbulb,
    mobilePlacement: 'tab',
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: Tag,
    mobilePlacement: 'tab',
  },
  {
    label: 'Book a Call',
    href: '/book-a-call',
    icon: Calendar,
    mobilePlacement: 'tab',
  },
];

export const LANDING_PUBLIC_NAV_LINKS: PublicNavLink[] = LANDING_PUBLIC_NAV_ITEMS.map(
  ({ label, href }) => ({ label, href }),
);

const PUBLIC_MOBILE_HOME_TAB: PublicMobileTab = {
  label: 'Home',
  path: '/',
  icon: Home,
};

function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function getPublicMobileTabItems(): PublicMobileTab[] {
  const navTabs = LANDING_PUBLIC_NAV_ITEMS.filter(
    (item) => item.mobilePlacement === 'tab',
  ).map((item) => ({
    label: item.label,
    path: item.href,
    icon: item.icon,
    external: isExternalHref(item.href),
  }));

  return [PUBLIC_MOBILE_HOME_TAB, ...navTabs];
}

export function getPublicOverflowNavItems(): PublicOverflowNavItem[] {
  const overflowItems = LANDING_PUBLIC_NAV_ITEMS.filter(
    (item) => item.mobilePlacement === 'overflow',
  ).map((item) => ({
    path: item.href,
    label: item.label,
    icon: item.icon,
    external: isExternalHref(item.href),
  }));

  return [
    ...overflowItems,
    { path: '/auth', label: 'Login', icon: LogIn },
  ];
}
