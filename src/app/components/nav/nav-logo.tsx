import { Link } from 'react-router';
import { useTheme } from '../../contexts/theme-context';
import logoWhite from '@/assets/13a610c2eb52d37dcdb23da9c6c27891d7b11cf3.png';
import logoBlack from '@/assets/45d2c3ca8dcadef95132a6169f23902806153f9c.png';
import logoMark from '@/assets/logo-mark.png';

type NavLogoProps = {
  to?: string;
  className?: string;
};

export function NavLogo({ to = '/links', className = 'h-10 w-auto' }: NavLogoProps) {
  const { isDark, mounted } = useTheme();
  const showDarkLogo = !mounted || isDark;

  return (
    <Link to={to} className="flex items-center shrink-0">
      <img
        src={showDarkLogo ? logoWhite : logoBlack}
        alt="Blackcollar.io"
        className={className}
      />
    </Link>
  );
}

/** Compact B mark for collapsed desktop sidebar */
export function NavLogoMark({ to = '/links', className = 'h-9 w-9' }: NavLogoProps) {
  return (
    <Link to={to} className="flex items-center justify-center shrink-0">
      <img
        src={logoMark}
        alt="Blackcollar.io"
        className={`${className} rounded-full object-cover`}
      />
    </Link>
  );
}

export function PublicNavLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  const { isDark, mounted } = useTheme();
  const showDarkLogo = !mounted || isDark;

  return (
    <Link to="/" className="flex items-center shrink-0">
      <img
        src={showDarkLogo ? logoWhite : logoBlack}
        alt="Blackcollar.io"
        className={className}
      />
    </Link>
  );
}
