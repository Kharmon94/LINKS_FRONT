import { useEffect, useState } from 'react';
import { AppTopNav } from './nav/app-top-nav';
import { AppBottomNav } from './nav/app-bottom-nav';
import { AppSidebar } from './nav/app-sidebar';
import {
  DESKTOP_SIDEBAR_COLLAPSED_MARGIN_CLASS,
  DESKTOP_SIDEBAR_EXPANDED_MARGIN_CLASS,
  MOBILE_BOTTOM_NAV_CLEARANCE_CLASS,
} from './nav/nav-utils';
import { Footer } from './footer';
import { Toaster } from './ui/sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? (JSON.parse(saved) as boolean) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      <AppTopNav />
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <main
        className={`w-full min-w-0 pt-16 lg:pt-[73px] transition-all duration-300 ${
          sidebarCollapsed ? DESKTOP_SIDEBAR_COLLAPSED_MARGIN_CLASS : DESKTOP_SIDEBAR_EXPANDED_MARGIN_CLASS
        } ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS}`}
      >
        {children}
      </main>
      <AppBottomNav />
      <Footer className={`lg:pb-0 ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS}`} />
      <Toaster richColors position="top-right" />
    </div>
  );
}
