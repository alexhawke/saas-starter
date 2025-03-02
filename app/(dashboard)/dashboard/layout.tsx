'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Settings, 
  Shield, 
  Activity, 
  Menu, 
  X, 
  ChevronRight,
  Home,
  PanelLeft,
  Bell,
  Search
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Team' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' },
  ];

  return (
    <div className="h-[calc(100dvh-68px)] max-w-full">
      {/* Top navigation - mobile */}
      <div className="lg:hidden flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 h-16 border-b border-slate-200">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="mr-2"
            aria-label="Toggle mobile menu"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5 text-slate-600" />
            ) : (
              <Menu className="h-5 w-5 text-slate-600" />
            )}
          </Button>
          <span className="font-semibold text-slate-900">Dashboard</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-slate-600">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-orange-500 rounded-full"></span>
          </Button>
        </div>
      </div>

      <div className="flex h-full overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'lg:w-72' : 'lg:w-20'
          } bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm relative z-30 
          ${isMobileOpen ? 'w-72 absolute inset-y-0 left-0 z-50' : 'w-0 -translate-x-full lg:translate-x-0 hidden lg:block'}
          `}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
            <div className={`flex items-center ${!isSidebarOpen && 'lg:justify-center lg:w-full'}`}>
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                <Home className="h-5 w-5 text-white" />
              </div>
              {(isSidebarOpen || isMobileOpen) && (
                <span className="ml-3 font-bold text-slate-900">Dashboard</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex"
              aria-label="Toggle sidebar"
            >
              <PanelLeft className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`} />
            </Button>
          </div>

          <div className="h-full overflow-y-auto py-6">
            <nav className={`px-3 ${!isSidebarOpen && 'lg:px-2'}`}>
              {isSidebarOpen || isMobileOpen ? (
                <div className="mb-6 px-3">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Settings
                  </h2>
                </div>
              ) : null}

              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} passHref>
                      <Button
                        variant="ghost"
                        className={`group relative w-full justify-start font-medium px-3 h-12 rounded-xl transition-all duration-200
                          ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 hover:from-orange-100 hover:to-amber-100'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          } 
                          ${!isSidebarOpen && 'lg:justify-center lg:px-0'}
                        `}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <div className={`flex items-center w-full ${!isSidebarOpen && 'lg:justify-center'}`}>
                          <span className={`flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'drop-shadow-md' : ''}`} />
                          </span>
                          
                          {(isSidebarOpen || isMobileOpen) && (
                            <>
                              <span className="ml-3">{item.label}</span>
                              {isActive && <ChevronRight className="ml-auto h-4 w-4 text-orange-500" />}
                            </>
                          )}
                        </div>
                        
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full shadow-md"></div>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay when mobile sidebar is open */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main 
          className={`flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 ${
            mounted ? 'transition-all duration-300 ease-in-out' : ''
          }`}
        >
          {/* Desktop top bar */}
          <div className="hidden lg:flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-10 h-16 border-b border-slate-200 px-6">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 h-10 bg-slate-100 border-0 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white"
                />
              </div>
              <Button variant="ghost" size="icon" className="text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-orange-500 rounded-full"></span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
