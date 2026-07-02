import { describe, it, expect } from 'vitest';
import type { UserPermissions } from '@/types';
import {
  getDesktopSidebarFooterItems,
  getDesktopSidebarNavItems,
  getMobileMoreNavItems,
  getMobileTabNavItems,
  type AppNavContext,
} from './app-nav-items';

function makePermissions(overrides: Partial<UserPermissions> = {}): UserPermissions {
  return {
    platformAdmin: false,
    links: { read: true, create: true, update: true, destroy: true },
    campaigns: { read: true, create: true, update: true, destroy: true },
    team: { read: true, invite: true, manage: true, removeMember: true },
    workspaces: { read: true, create: true, update: true, destroy: true },
    settings: { billing: true, portal: true, domains: true },
    analytics: { read: true },
    admin: { users: false, links: false },
    ...overrides,
  };
}

function makeCtx(overrides: Partial<AppNavContext> = {}): AppNavContext {
  return {
    permissions: makePermissions(),
    platformAdmin: false,
    ...overrides,
  };
}

describe('app-nav-items', () => {
  it('orders primary nav with Links first and Analytics second', () => {
    const items = getDesktopSidebarNavItems(makeCtx());
    expect(items.map((item) => item.label)).toEqual([
      'Links',
      'Analytics',
      'Campaigns',
      'Team',
    ]);
    expect(items[1]?.path).toBe('/dashboard');
  });

  it('exposes the same four tabs on mobile', () => {
    const items = getMobileTabNavItems(makeCtx());
    expect(items.map((item) => item.label)).toEqual([
      'Links',
      'Analytics',
      'Campaigns',
      'Team',
    ]);
  });

  it('puts Settings, Workspaces, and Admin in the More sheet', () => {
    const items = getMobileMoreNavItems(
      makeCtx({ platformAdmin: true }),
    );
    expect(items.map((item) => item.label)).toEqual([
      'Workspaces',
      'Settings',
      'Admin',
    ]);
  });

  it('hides items the user cannot access while preserving order', () => {
    const items = getDesktopSidebarNavItems(
      makeCtx({
        permissions: makePermissions({
          analytics: { read: false },
          team: { read: false, invite: false, manage: false, removeMember: false },
        }),
      }),
    );
    expect(items.map((item) => item.label)).toEqual(['Links', 'Campaigns']);
  });

  it('omits Workspaces from sidebar footer when not permitted', () => {
    const items = getDesktopSidebarFooterItems(
      makeCtx({
        permissions: makePermissions({
          workspaces: { read: false, create: false, update: false, destroy: false },
        }),
      }),
    );
    expect(items.map((item) => item.label)).toEqual(['Settings']);
  });

  it('includes Admin in sidebar footer for platform admins', () => {
    const items = getDesktopSidebarFooterItems(makeCtx({ platformAdmin: true }));
    expect(items.map((item) => item.label)).toContain('Admin');
  });
});
