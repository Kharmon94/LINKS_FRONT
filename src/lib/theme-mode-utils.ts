import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

export const THEME_CYCLE = ['light', 'dark', 'system'] as const;
export type ThemePreference = (typeof THEME_CYCLE)[number];

/** Hex backgrounds for iOS status-bar / theme-color sampling (must match --background). */
export const THEME_BACKGROUND_LIGHT = '#ffffff';
export const THEME_BACKGROUND_DARK = '#0a0a0a';

export function themeBackgroundHex(resolved: 'light' | 'dark'): string {
  return resolved === 'dark' ? THEME_BACKGROUND_DARK : THEME_BACKGROUND_LIGHT;
}

/**
 * Sync theme-color meta + root/body background to a resolved hex.
 * iOS Safari 26+ tints the PWA status bar from body background (and ignores
 * oklch/CSS variables when sampling), so this must be a concrete hex.
 */
export function applyThemeChrome(resolved: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const color = themeBackgroundHex(resolved);
  const root = document.documentElement;
  root.style.backgroundColor = color;
  if (document.body) {
    document.body.style.backgroundColor = color;
  }
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

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
