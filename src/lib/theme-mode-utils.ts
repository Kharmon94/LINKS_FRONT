import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

export const THEME_CYCLE = ['light', 'dark', 'system'] as const;
export type ThemePreference = (typeof THEME_CYCLE)[number];

export function nextThemeInCycle(current: ThemePreference): ThemePreference {
  const index = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

export function themeModeLabel(theme: ThemePreference): string {
  switch (theme) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'system':
      return 'System';
  }
}

export function themeModeIcon(theme: ThemePreference): LucideIcon {
  switch (theme) {
    case 'light':
      return Sun;
    case 'dark':
      return Moon;
    case 'system':
      return Monitor;
  }
}
