import { describe, it, expect, beforeEach } from 'vitest';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  THEME_BACKGROUND_DARK,
  THEME_BACKGROUND_LIGHT,
  THEME_CYCLE,
  applyThemeChrome,
  nextThemeInCycle,
  themeBackgroundHex,
  themeModeIcon,
  themeModeLabel,
  type ThemePreference,
} from './theme-mode-utils';

describe('themeBackgroundHex', () => {
  it('returns light and dark chrome hexes', () => {
    expect(themeBackgroundHex('light')).toBe(THEME_BACKGROUND_LIGHT);
    expect(themeBackgroundHex('dark')).toBe(THEME_BACKGROUND_DARK);
  });
});

describe('applyThemeChrome', () => {
  beforeEach(() => {
    document.documentElement.style.backgroundColor = '';
    document.body.style.backgroundColor = '';
    document.querySelector('meta[name="theme-color"]')?.remove();
  });

  it('sets root, body, and theme-color meta to the dark hex', () => {
    applyThemeChrome('dark');
    expect(document.documentElement.style.backgroundColor).toBe('rgb(10, 10, 10)');
    expect(document.body.style.backgroundColor).toBe('rgb(10, 10, 10)');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      THEME_BACKGROUND_DARK,
    );
  });

  it('sets root, body, and theme-color meta to the light hex', () => {
    applyThemeChrome('light');
    expect(document.documentElement.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(document.body.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      THEME_BACKGROUND_LIGHT,
    );
  });
});

describe('nextThemeInCycle', () => {
  it('cycles light → dark → system → light', () => {
    expect(nextThemeInCycle('light')).toBe('dark');
    expect(nextThemeInCycle('dark')).toBe('system');
    expect(nextThemeInCycle('system')).toBe('light');
  });

  it('covers every step in THEME_CYCLE', () => {
    let current: ThemePreference = 'light';
    const visited: ThemePreference[] = [];

    for (let i = 0; i < THEME_CYCLE.length; i++) {
      visited.push(current);
      current = nextThemeInCycle(current);
    }

    expect(visited).toEqual([...THEME_CYCLE]);
    expect(current).toBe('light');
  });
});

describe('themeModeLabel', () => {
  it('maps each preference to a display label', () => {
    expect(themeModeLabel('light')).toBe('Light');
    expect(themeModeLabel('dark')).toBe('Dark');
    expect(themeModeLabel('system')).toBe('System');
  });
});

describe('themeModeIcon', () => {
  it('maps each preference to the correct icon', () => {
    expect(themeModeIcon('light')).toBe(Sun);
    expect(themeModeIcon('dark')).toBe(Moon);
    expect(themeModeIcon('system')).toBe(Monitor);
  });
});
