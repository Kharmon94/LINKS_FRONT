import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { NotificationPreferenceRow } from './notification-preference-row';
import {
  MOBILE_DRAWER_BOTTOM_PADDING_CLASS,
  MOBILE_DRAWER_MAX_HEIGHT_CLASS,
} from './nav/nav-utils';
import type { NotificationPreferences } from '@/services/account-api';
import type { LinkJson } from '@/types';
import type { LinkPayload } from '@/services/links-api';

export type AlertIntervalUnit = 'days' | 'weeks' | 'months' | 'years';
export type AlertIntervalKind = 'time' | 'clicks';

type LinkAlertsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkJson;
  notifPrefs: NotificationPreferences | null;
  pushSubscribed: boolean;
  canEdit: boolean;
  onSave: (payload: LinkPayload) => Promise<void>;
};

type AlertDraft = {
  pushAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  alertIntervalKind: AlertIntervalKind;
  alertIntervalValue: number;
  alertIntervalUnit: AlertIntervalUnit;
};

const INTERVAL_UNITS: { value: AlertIntervalUnit; label: string }[] = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

function draftFromLink(link: LinkJson): AlertDraft {
  return {
    pushAlertsEnabled: link.pushAlertsEnabled ?? true,
    emailAlertsEnabled: link.emailAlertsEnabled ?? false,
    alertIntervalKind: link.alertIntervalKind ?? 'time',
    alertIntervalValue: link.alertIntervalValue ?? (link.alertIntervalKind === 'clicks' ? 10 : 1),
    alertIntervalUnit: link.alertIntervalUnit ?? 'weeks',
  };
}

export function LinkAlertsModal({
  open,
  onOpenChange,
  link,
  notifPrefs,
  pushSubscribed,
  canEdit,
  onSave,
}: LinkAlertsModalProps) {
  const [draft, setDraft] = useState<AlertDraft>(() => draftFromLink(link));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(draftFromLink(link));
    }
  }, [open, link]);

  const handleCancel = () => {
    setDraft(draftFromLink(link));
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    if (draft.alertIntervalValue < 1 || !Number.isInteger(draft.alertIntervalValue)) {
      toast.error('Interval must be a whole number of at least 1');
      return;
    }

    setSaving(true);
    try {
      const payload: LinkPayload = {
        push_alerts_enabled: draft.pushAlertsEnabled,
        email_alerts_enabled: draft.emailAlertsEnabled,
        alert_interval_kind: draft.alertIntervalKind,
        alert_interval_value: draft.alertIntervalValue,
      };
      if (draft.alertIntervalKind === 'time') {
        payload.alert_interval_unit = draft.alertIntervalUnit;
      }
      await onSave(payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const pushDisabled =
    !canEdit || saving || !notifPrefs?.push_link_alerts || !pushSubscribed;
  const emailDisabled = !canEdit || saving || !notifPrefs?.email_link_alerts;
  const isTimeInterval = draft.alertIntervalKind === 'time';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={`${MOBILE_DRAWER_MAX_HEIGHT_CLASS} flex flex-col overflow-hidden`}>
        <DrawerHeader className="shrink-0">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <DrawerTitle>Link alerts</DrawerTitle>
          <DrawerDescription>
            Milestone notifications for this link. Push and email share the same interval.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-6 px-4 pb-2">
            {!notifPrefs ? (
              <p className="text-sm text-muted-foreground">Loading preferences...</p>
            ) : (
              <div>
                <NotificationPreferenceRow
                  title="Push alerts"
                  description="Notify on this link's click milestones"
                  checked={draft.pushAlertsEnabled}
                  disabled={pushDisabled}
                  onCheckedChange={(value) => setDraft((prev) => ({ ...prev, pushAlertsEnabled: value }))}
                />
                <NotificationPreferenceRow
                  title="Email alerts"
                  description="Email on this link's milestones"
                  checked={draft.emailAlertsEnabled}
                  disabled={emailDisabled}
                  onCheckedChange={(value) => setDraft((prev) => ({ ...prev, emailAlertsEnabled: value }))}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label>Interval type</Label>
              <ToggleGroup
                type="single"
                value={draft.alertIntervalKind}
                disabled={!canEdit || saving}
                onValueChange={(value) => {
                  if (!value) return;
                  const kind = value as AlertIntervalKind;
                  setDraft((prev) => ({
                    ...prev,
                    alertIntervalKind: kind,
                    alertIntervalValue: kind === 'clicks' ? 10 : 1,
                    alertIntervalUnit: kind === 'time' ? prev.alertIntervalUnit : 'weeks',
                  }));
                }}
                className="w-full"
              >
                <ToggleGroupItem value="time" aria-label="Time interval" className="flex-1">
                  Time
                </ToggleGroupItem>
                <ToggleGroupItem value="clicks" aria-label="Click interval" className="flex-1">
                  Clicks
                </ToggleGroupItem>
              </ToggleGroup>

              <div className="space-y-2">
                <Label htmlFor="alert-interval-value">
                  {isTimeInterval ? 'Check-in interval' : 'Notify every'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="alert-interval-value"
                    type="number"
                    min={1}
                    step={1}
                    value={draft.alertIntervalValue}
                    disabled={!canEdit || saving}
                    onChange={(event) => {
                      const parsed = parseInt(event.target.value, 10);
                      setDraft((prev) => ({
                        ...prev,
                        alertIntervalValue: Number.isNaN(parsed) ? 1 : Math.max(1, parsed),
                      }));
                    }}
                    className="w-24"
                  />
                  {isTimeInterval ? (
                    <Select
                      value={draft.alertIntervalUnit}
                      disabled={!canEdit || saving}
                      onValueChange={(value: AlertIntervalUnit) =>
                        setDraft((prev) => ({ ...prev, alertIntervalUnit: value }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[130]" position="popper" sideOffset={4}>
                        {INTERVAL_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-1 items-center rounded-sm border border-input bg-input-background px-3 text-sm text-muted-foreground">
                      clicks
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isTimeInterval
                    ? 'How often to check this link for milestones.'
                    : 'Send an alert after this many new clicks (e.g. every 10 clicks).'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className={`shrink-0 gap-2 ${MOBILE_DRAWER_BOTTOM_PADDING_CLASS}`}>
          <Button type="button" onClick={() => void handleSave()} disabled={!canEdit || saving} className="w-full">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving} className="w-full">
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
