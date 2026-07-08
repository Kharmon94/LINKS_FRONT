import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { NotificationPreferenceRow } from './notification-preference-row';
import type { NotificationPreferences } from '@/services/account-api';
import type { LinkJson } from '@/types';
import type { LinkPayload } from '@/services/links-api';

export type AlertIntervalUnit = 'days' | 'weeks' | 'months' | 'years';

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
    emailAlertsEnabled: link.emailAlertsEnabled ?? true,
    alertIntervalValue: link.alertIntervalValue ?? 1,
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
      await onSave({
        push_alerts_enabled: draft.pushAlertsEnabled,
        email_alerts_enabled: draft.emailAlertsEnabled,
        alert_interval_value: draft.alertIntervalValue,
        alert_interval_unit: draft.alertIntervalUnit,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const pushDisabled =
    !canEdit || saving || !notifPrefs?.push_link_alerts || !pushSubscribed;
  const emailDisabled = !canEdit || saving || !notifPrefs?.email_link_alerts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link alerts</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Milestone notifications for this link. Push and email share the same check-in interval.
        </p>

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

        <div className="space-y-2">
          <Label htmlFor="alert-interval-value">Check-in interval</Label>
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
              <SelectContent>
                {INTERVAL_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={!canEdit || saving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
