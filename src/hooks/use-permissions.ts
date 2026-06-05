import { useMemo } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import type { UserPermissions, UserLimits } from '@/types';

const DEFAULT_PERMISSIONS: UserPermissions = {
  platformAdmin: false,
  links: { read: true, create: true, update: true, destroy: true },
  campaigns: { read: false, create: false, update: false, destroy: false },
  team: { read: false, invite: false, manage: false },
  workspaces: { read: false, create: false, update: false, destroy: false },
  settings: { billing: false, domains: false },
  analytics: { read: true },
  admin: { users: false, links: false },
};

const DEFAULT_LIMITS: UserLimits = {
  links: { used: 0, max: 1 },
  campaigns: { used: 0, max: 0 },
};

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      permissions: user?.permissions ?? DEFAULT_PERMISSIONS,
      limits: user?.limits ?? DEFAULT_LIMITS,
      platformAdmin: user?.permissions?.platformAdmin ?? user?.admin ?? false,
      can: {
        readLinks: user?.permissions?.links.read ?? true,
        createLinks: user?.permissions?.links.create ?? true,
        updateLinks: user?.permissions?.links.update ?? true,
        destroyLinks: user?.permissions?.links.destroy ?? true,
        readCampaigns: user?.permissions?.campaigns.read ?? false,
        createCampaigns: user?.permissions?.campaigns.create ?? false,
        readTeam: user?.permissions?.team.read ?? false,
        readWorkspaces: user?.permissions?.workspaces.read ?? false,
        billing: user?.permissions?.settings.billing ?? false,
        domains: user?.permissions?.settings.domains ?? false,
        analytics: user?.permissions?.analytics.read ?? true,
      },
    }),
    [user]
  );
}
