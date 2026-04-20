import { useState, useEffect } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { Sidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  };

  // Save to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isDesktopSidebarCollapsed));
  }, [isDesktopSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      <Header onMenuToggle={toggleSidebar} />
      
      <div className="flex pt-[73px] w-full">
        {/* Sidebar - visible on desktop, toggleable on mobile */}
        <Sidebar 
          id="app-sidebar"
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          isDesktopCollapsed={isDesktopSidebarCollapsed}
          onDesktopToggle={toggleDesktopSidebar}
        />
        
        {/* Main Content - with left margin on desktop to account for sidebar */}
        <main className={`flex-1 w-full min-w-0 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}