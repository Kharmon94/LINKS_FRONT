import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from 'next-themes';
import { nextThemeInCycle, type ThemePreference } from '@/lib/theme-mode-utils';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  resolvedTheme: 'light' | 'dark' | undefined;
  isDark: boolean;
  cycleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function toThemePreference(value: string | undefined): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
}

function ThemeContextBridge({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const preference = toThemePreference(theme);

  const cycleTheme = useCallback(() => {
    setTheme(nextThemeInCycle(preference));
  }, [preference, setTheme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: preference,
      setTheme: (next) => setTheme(next),
      resolvedTheme:
        resolvedTheme === 'light' || resolvedTheme === 'dark'
          ? resolvedTheme
          : undefined,
      isDark: resolvedTheme === 'dark',
      cycleTheme,
      mounted,
    }),
    [preference, setTheme, resolvedTheme, cycleTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="links-theme"
      disableTransitionOnChange
    >
      <ThemeContextBridge>{children}</ThemeContextBridge>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
