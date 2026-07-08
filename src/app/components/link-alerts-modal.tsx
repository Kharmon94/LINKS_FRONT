import { EntityAlertsDrawer } from './entity-alerts-drawer';
import type { NotificationPreferences } from '@/services/account-api';
import type { LinkJson } from '@/types';
import type { LinkPayload } from '@/services/links-api';

type LinkAlertsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkJson;
  notifPrefs: NotificationPreferences | null;
  pushSubscribed: boolean;
  canEdit: boolean;
  onSave: (payload: LinkPayload) => Promise<void>;
};

export function LinkAlertsModal({
  open,
  onOpenChange,
  link,
  notifPrefs,
  pushSubscribed,
  canEdit,
  onSave,
}: LinkAlertsModalProps) {
  return (
    <EntityAlertsDrawer
      open={open}
      onOpenChange={onOpenChange}
      entityType="link"
      preferences={link}
      notifPrefs={notifPrefs}
      pushSubscribed={pushSubscribed}
      canEdit={canEdit}
      onSave={onSave}
    />
  );
}

export type { AlertIntervalKind, AlertIntervalUnit } from './entity-alerts-drawer';
