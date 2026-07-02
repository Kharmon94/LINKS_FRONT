import { Link } from 'react-router';
import { useTheme } from '../../contexts/theme-context';
import logoWhite from '@/assets/13a610c2eb52d37dcdb23da9c6c27891d7b11cf3.png';
import logoBlack from '@/assets/45d2c3ca8dcadef95132a6169f23902806153f9c.png';

type NavLogoProps = {
  to?: string;
  className?: string;
};

export function NavLogo({ to = '/links', className = 'h-10 w-auto' }: NavLogoProps) {
  const { isDark } = useTheme();

  return (
    <Link to={to} className="flex items-center shrink-0">
      <img
        src={isDark ? logoWhite : logoBlack}
        alt="Blackcollar.io"
        className={className}
      />
    </Link>
  );
}

export function PublicNavLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  const { isDark } = useTheme();

  return (
    <Link to="/" className="flex items-center shrink-0">
      <img
        src={isDark ? logoWhite : logoBlack}
        alt="Blackcollar.io"
        className={className}
      />
    </Link>
  );
}
