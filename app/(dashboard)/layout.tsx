'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CircleIcon, 
  Home, 
  LogOut, 
  Bell, 
  Search, 
  Settings, 
  ChevronDown, 
  Menu as MenuIcon,
  X,
  User,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(login)/actions';
import { useRouter, usePathname } from 'next/navigation';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-700"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md overflow-hidden group">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <CircleIcon className="h-5 w-5 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="ml-3 text-xl font-bold text-slate-900 hidden sm:block">ACME</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden lg:flex lg:space-x-8 items-center">
            <Link 
              href="/" 
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname === "/" 
                  ? "text-orange-600 bg-orange-50" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname.includes("/dashboard") 
                  ? "text-orange-600 bg-orange-50" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/pricing"
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname === "/pricing" 
                  ? "text-orange-600 bg-orange-50" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hidden sm:flex text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-orange-500 rounded-full"></span>
                </Button>
              
                <div className="hidden sm:flex relative h-10 w-40 group">
                  <div className="absolute inset-0 bg-slate-100 rounded-lg transition-all duration-300 group-hover:bg-slate-200"></div>
                  <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none z-10">
                    <Search className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    type="search" 
                    placeholder="Search..." 
                    className="pl-9 pr-4 py-2 h-full bg-transparent border-0 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 relative z-0 w-full"
                  />
                </div>
              </>
            )}

            {user ? (
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 pl-3 pr-9 rounded-full flex items-center border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <Avatar className="cursor-pointer h-7 w-7 rounded-full border-2 border-white shadow-sm mr-2">
                      <AvatarImage alt={user.name || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-medium">
                        {user.email
                          ? user.email.substring(0, 2).toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-slate-700 mr-1 truncate max-w-[80px]">
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-500 absolute right-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 mt-1 rounded-xl shadow-xl border border-slate-200 animate-in slide-in-from-top-5 duration-200">
                  <div className="px-3 py-2 mb-1 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-500">Signed in as</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <DropdownMenuItem className="rounded-lg h-10 cursor-pointer hover:bg-slate-50 px-3">
                      <Link href="/dashboard" className="flex w-full items-center">
                        <Home className="mr-2 h-4 w-4 text-slate-500" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="rounded-lg h-10 cursor-pointer hover:bg-slate-50 px-3">
                      <Link href="/dashboard/general" className="flex w-full items-center">
                        <Settings className="mr-2 h-4 w-4 text-slate-500" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="rounded-lg h-10 cursor-pointer hover:bg-slate-50 px-3">
                      <Link href="/dashboard" className="flex w-full items-center">
                        <User className="mr-2 h-4 w-4 text-slate-500" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <div className="py-1">
                    <form action={handleSignOut} className="w-full">
                      <button type="submit" className="flex w-full">
                        <DropdownMenuItem className="w-full flex-1 cursor-pointer rounded-lg h-10 hover:bg-rose-50 text-rose-600 hover:text-rose-700 px-3">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign out</span>
                        </DropdownMenuItem>
                      </button>
                    </form>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-3">
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 h-10 px-4 rounded-lg"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium h-10 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Link href="/sign-up" className="flex items-center">
                    <span className="relative z-10">Sign Up</span>
                    <Sparkles className="relative z-10 ml-2 h-4 w-4" />
                    <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 bg-gradient-to-r from-orange-600 to-orange-700 transition-transform duration-300 ease-in-out"></div>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname === "/" 
                  ? "text-orange-600 bg-orange-50" 
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname.includes("/dashboard") 
                  ? "text-orange-600 bg-orange-50" 
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/pricing" 
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname === "/pricing" 
                  ? "text-orange-600 bg-orange-50" 
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Pricing
            </Link>
          </div>
          
          {user && (
            <>
              <div className="px-4 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    type="search" 
                    placeholder="Search..." 
                    className="block w-full pl-10 pr-3 py-2 bg-slate-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-900"
                  />
                </div>
              </div>
              
              <div className="border-t border-slate-100 px-4 py-3">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 rounded-full border-2 border-white shadow-sm">
                    <AvatarImage alt={user.name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-medium">
                      {user.email
                        ? user.email.substring(0, 2).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-900">
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <section className={`flex flex-col min-h-screen bg-slate-50 ${mounted ? 'transition-colors duration-300' : ''}`}>
      <Header />
      <div className="flex-1 relative">
        {mounted && (
          <>
            <div className="absolute top-0 left-0 h-64 w-64 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
          </>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
      <footer className="py-8 border-t border-slate-200 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ACME Inc. All rights reserved.</p>
        </div>
      </footer>
    </section>
  );
}
