import { useTheme } from '../../contexts/theme-context';
import { themeModeIcon, themeModeLabel } from '@/lib/theme-mode-utils';

type NavThemeToggleProps = {
  className?: string;
};

export function NavThemeToggle({ className = 'p-2 rounded-sm hover:bg-accent/50 transition-colors' }: NavThemeToggleProps) {
  const { theme, cycleTheme, mounted } = useTheme();
  const ThemeIcon = mounted ? themeModeIcon(theme) : themeModeIcon('system');
  const label = themeModeLabel(theme);

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={className}
      aria-label={`Theme: ${label}. Tap to change.`}
    >
      <ThemeIcon className="w-5 h-5" />
    </button>
  );
}
