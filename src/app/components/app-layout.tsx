import { useEffect, useState } from 'react';
import { AppBottomNav } from './nav/app-bottom-nav';
import { AppSidebar } from './nav/app-sidebar';
import {
  DESKTOP_SIDEBAR_COLLAPSED_MARGIN_CLASS,
  DESKTOP_SIDEBAR_EXPANDED_MARGIN_CLASS,
  MOBILE_BOTTOM_NAV_CLEARANCE_CLASS,
  SAFE_AREA_TOP_PADDING_CLASS,
  SAFE_AREA_TOP_WITH_BANNER_PADDING_CLASS,
} from './nav/nav-utils';
import { Footer } from './footer';
import { Toaster } from './ui/sonner';
import { usePwaInstall } from '@/app/contexts/pwa-install-context';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { bannerVisible } = usePwaInstall();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? (JSON.parse(saved) as boolean) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground w-full overflow-x-hidden">
      {/* Opaque status-bar backdrop when iOS draws the webview under the notch */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[env(safe-area-inset-top,0px)] bg-background"
      />
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        bannerVisible={bannerVisible}
      />
      <main
        className={`w-full min-w-0 transition-all duration-300 ${
          bannerVisible ? SAFE_AREA_TOP_WITH_BANNER_PADDING_CLASS : SAFE_AREA_TOP_PADDING_CLASS
        } ${
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
