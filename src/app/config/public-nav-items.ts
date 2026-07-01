import { Home, Tag, LogIn, type LucideIcon } from 'lucide-react';

export type PublicNavLink = {
  label: string;
  href: string;
};

export type PublicMobileTab = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const DEFAULT_PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '#' },
];

export const LANDING_PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { label: 'Products', href: 'https://www.blackcollar.io' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Book a Call', href: '/book-a-call' },
];

export const PUBLIC_MOBILE_TABS: PublicMobileTab[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Pricing', path: '/pricing', icon: Tag },
  { label: 'Login', path: '/auth', icon: LogIn },
];
