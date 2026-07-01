import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/theme-context';

type NavThemeToggleProps = {
  className?: string;
};

export function NavThemeToggle({ className = 'p-2 rounded-sm hover:bg-accent/50 transition-colors' }: NavThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
