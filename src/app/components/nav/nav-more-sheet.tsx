import { Link, useLocation } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '../ui/sheet';
import { isNavPathActive, NAV_MORE_SHEET_Z_CLASS } from './nav-utils';

export type NavMoreActionItem = {
  kind: 'action';
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export type NavMoreLinkItem = {
  kind: 'link';
  path: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
};

export type NavMoreSheetItem = NavMoreLinkItem | NavMoreActionItem;

/** @deprecated Use NavMoreLinkItem */
export type NavMoreItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
};

type NavMoreSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  items: NavMoreSheetItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export function NavMoreSheet({
  open,
  onOpenChange,
  title = 'More',
  items,
  header,
  footer,
}: NavMoreSheetProps) {
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        overlayClassName={NAV_MORE_SHEET_Z_CLASS}
        className={`rounded-t-2xl ${NAV_MORE_SHEET_Z_CLASS} pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]`}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {header ? (
          <div className="px-2 pb-3 mb-1 border-b border-border/30">{header}</div>
        ) : null}
        <nav className="space-y-1 pt-2">
          {items.map((item) => {
            const Icon = item.icon;

            if (item.kind === 'action') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-full transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-light">{item.label}</span>
                </button>
              );
            }

            const isActive = isNavPathActive(location.pathname, item.path);
            const itemClassName = `flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
              isActive
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`;

            if (item.external) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOpenChange(false)}
                  className={itemClassName}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-light">{item.label}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={itemClassName}
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
