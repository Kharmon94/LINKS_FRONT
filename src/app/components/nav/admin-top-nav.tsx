import { Shield } from 'lucide-react';
import { ADMIN_MOBILE_HEADER_SAFE_CLASS } from './nav-utils';

/** Mobile-only admin header. Desktop navigation lives in AdminSidebar. */
export function AdminTopNav() {
  return (
    <header
      className={`lg:hidden fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md ${ADMIN_MOBILE_HEADER_SAFE_CLASS}`}
    >
      <div className="flex items-center justify-center h-16 px-4 gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-semibold">Platform Admin</span>
      </div>
    </header>
  );
}
