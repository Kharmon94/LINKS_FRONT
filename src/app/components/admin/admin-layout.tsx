import { useState } from 'react';
import { Outlet } from 'react-router';
import { Menu, Shield } from 'lucide-react';
import { AdminSidebar } from './admin-sidebar';
import { Toaster } from '../ui/sonner';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/30 bg-card/50 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-[73px] lg:pl-64">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 hover:bg-muted rounded-full"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold hidden sm:inline">Platform Admin</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
