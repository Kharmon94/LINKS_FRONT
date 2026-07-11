import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { AdminTopNav } from '../nav/admin-top-nav';
import { AdminSidebar } from '../nav/admin-sidebar';
import { AdminBottomNav } from '../nav/admin-bottom-nav';
import {
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
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <AdminTopNav />
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <main
        className={`pt-16 lg:pt-0 transition-all duration-300 ${
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
