import { Link, useLocation } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

export type NavMoreItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

type NavMoreSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  items: NavMoreItem[];
  footer?: React.ReactNode;
};

export function NavMoreSheet({
  open,
  onOpenChange,
  title = 'More',
  items,
  footer,
}: NavMoreSheetProps) {
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-light">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {footer ? <div className="mt-4 pt-4 border-t border-border/30">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  );
}
