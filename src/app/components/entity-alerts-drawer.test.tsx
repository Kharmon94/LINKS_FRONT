import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EntityAlertsDrawer } from './entity-alerts-drawer';
import type { AlertPreferencesFields } from './entity-alerts-drawer';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const basePrefs: AlertPreferencesFields = {
  pushAlertsEnabled: true,
  emailAlertsEnabled: false,
  alertIntervalKind: 'time',
  alertIntervalValue: 1,
  alertIntervalUnit: 'weeks',
};

const notifPrefs = {
  push_link_alerts: true,
  email_link_alerts: true,
  push_weekly_reports: true,
  email_weekly_reports: true,
  push_marketing: false,
  email_marketing: false,
};

describe('EntityAlertsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not reset draft while open when preferences reference changes', () => {
    const onOpenChange = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <EntityAlertsDrawer
        open
        onOpenChange={onOpenChange}
        entityType="link"
        preferences={basePrefs}
        notifPrefs={notifPrefs}
        pushSubscribed
        canEdit
        onSave={onSave}
      />
    );

    const clicksToggle = screen.getByRole('radio', { name: 'Click interval' });
    fireEvent.click(clicksToggle);
    expect(clicksToggle).toHaveAttribute('data-state', 'on');

    const polledPrefs: AlertPreferencesFields = { ...basePrefs };
    rerender(
      <EntityAlertsDrawer
        open
        onOpenChange={onOpenChange}
        entityType="link"
        preferences={polledPrefs}
        notifPrefs={notifPrefs}
        pushSubscribed
        canEdit
        onSave={onSave}
      />
    );

    expect(screen.getByRole('radio', { name: 'Click interval' })).toHaveAttribute('data-state', 'on');
    expect(screen.getByRole('radio', { name: 'Time interval' })).toHaveAttribute('data-state', 'off');
  });

  it('reseeds draft when the drawer opens', () => {
    const onOpenChange = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <EntityAlertsDrawer
        open={false}
        onOpenChange={onOpenChange}
        entityType="link"
        preferences={basePrefs}
        notifPrefs={notifPrefs}
        pushSubscribed
        canEdit
        onSave={onSave}
      />
    );

    const openPrefs: AlertPreferencesFields = {
      ...basePrefs,
      alertIntervalKind: 'clicks',
      alertIntervalValue: 10,
    };

    act(() => {
      rerender(
        <EntityAlertsDrawer
          open
          onOpenChange={onOpenChange}
          entityType="link"
          preferences={openPrefs}
          notifPrefs={notifPrefs}
          pushSubscribed
          canEdit
          onSave={onSave}
        />
      );
    });

    expect(screen.getByRole('radio', { name: 'Click interval' })).toHaveAttribute('data-state', 'on');
  });
});
