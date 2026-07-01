import { AppTopNav } from './nav/app-top-nav';
import { AppBottomNav } from './nav/app-bottom-nav';
import { Footer } from './footer';
import { Toaster } from './ui/sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      <AppTopNav />
      <main className="w-full min-w-0 pt-16 md:pt-[73px] pb-20 md:pb-0">
        {children}
      </main>
      <AppBottomNav />
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}
