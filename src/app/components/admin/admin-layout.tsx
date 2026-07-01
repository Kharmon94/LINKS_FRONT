import { Outlet } from 'react-router';
import { AdminTopNav } from '../nav/admin-top-nav';
import { AdminBottomNav } from '../nav/admin-bottom-nav';
import { MOBILE_BOTTOM_NAV_CLEARANCE_CLASS } from '../nav/nav-utils';
import { Toaster } from '../ui/sonner';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminTopNav />
      <main className={`pt-16 lg:pt-[73px] ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <AdminBottomNav />
      <Toaster richColors position="top-right" />
    </div>
  );
}
