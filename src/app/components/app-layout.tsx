import { AppTopNav } from './nav/app-top-nav';
import { AppBottomNav } from './nav/app-bottom-nav';
import { MOBILE_BOTTOM_NAV_CLEARANCE_CLASS } from './nav/nav-utils';
import { Footer } from './footer';
import { Toaster } from './ui/sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      <AppTopNav />
      <main className={`w-full min-w-0 pt-16 lg:pt-[73px] ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS}`}>
        {children}
      </main>
      <AppBottomNav />
      <Footer className={`lg:pb-0 ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS}`} />
      <Toaster richColors position="top-right" />
    </div>
  );
}
