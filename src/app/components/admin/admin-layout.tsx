import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { AdminTopNav } from '../nav/admin-top-nav';
import { AdminSidebar } from '../nav/admin-sidebar';
import { AdminBottomNav } from '../nav/admin-bottom-nav';
import {
  ADMIN_MOBILE_MAIN_TOP_PADDING_CLASS,
  DESKTOP_SIDEBAR_COLLAPSED_MARGIN_CLASS,
  DESKTOP_SIDEBAR_EXPANDED_MARGIN_CLASS,
  MOBILE_BOTTOM_NAV_CLEARANCE_CLASS,
} from '../nav/nav-utils';
import { Toaster } from '../ui/sonner';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? (JSON.parse(saved) as boolean) : false;
  });

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background w-full overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-10 h-[env(safe-area-inset-top,0px)] lg:hidden"
        style={{ backgroundColor: 'var(--chrome-background, #ffffff)' }}
      />
      <AdminTopNav />
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <main
        className={`transition-all duration-300 ${ADMIN_MOBILE_MAIN_TOP_PADDING_CLASS} ${
          sidebarCollapsed
            ? DESKTOP_SIDEBAR_COLLAPSED_MARGIN_CLASS
            : DESKTOP_SIDEBAR_EXPANDED_MARGIN_CLASS
        } ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <AdminBottomNav />
      <Toaster richColors position="top-right" />
    </div>
  );
}
