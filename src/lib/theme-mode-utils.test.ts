import { describe, it, expect } from 'vitest';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  THEME_CYCLE,
  nextThemeInCycle,
  themeModeIcon,
  themeModeLabel,
  type ThemePreference,
} from './theme-mode-utils';

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
