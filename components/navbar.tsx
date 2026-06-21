"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { Menu, Activity, Coins, X, Home, Lightbulb } from 'lucide-react';

export default function NavBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="h-14 bg-white border-b border-slate-200 px-4 flex justify-center items-center relative z-50">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/logo.svg" alt="Carbon Footprint Tracker Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            </div>
            <span className="text-lg font-bold text-slate-800">Carbon Footprint Tracker</span>
          </Link>
          <div className="hidden md:flex gap-4 items-center">
            <Link
              href="/"
              aria-current={pathname === '/' ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-700/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/tracker"
              aria-current={pathname.startsWith('/tracker') ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname.startsWith('/tracker')
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-700/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              Tracker
            </Link>
            <Link
              href="/insight"
              aria-current={pathname.startsWith('/insight') ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname.startsWith('/insight')
                  ? 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-700/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Insights
            </Link>
            <Link
              href="/achievement"
              aria-current={pathname.startsWith('/achievement') ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname.startsWith('/achievement')
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-700/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Coins className="w-4 h-4" />
              Achievements
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors relative z-[110]"
            title="Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {mounted && isMenuOpen && createPortal(
            <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center px-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Modal menu */}
              <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-white dark:bg-slate-900">
                  <label className="text-[14px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">Navigation</label>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-3 p-6 bg-slate-50/50 dark:bg-slate-900/50">
                  <Link
                    href="/"
                    aria-current={pathname === '/' ? "page" : undefined}
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname === '/'
                        ? 'text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                        : 'text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname === '/' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-blue-50 dark:bg-blue-950/40'}`}>
                      <Home className={`w-5 h-5 transition-colors ${pathname === '/' ? 'text-blue-700 dark:text-blue-400' : 'text-blue-600 dark:text-blue-500'}`} />
                    </div>
                    Home Dashboard
                  </Link>
                  <Link
                    href="/tracker"
                    aria-current={pathname.startsWith('/tracker') ? "page" : undefined}
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname.startsWith('/tracker')
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/tracker') ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-emerald-50 dark:bg-emerald-950/40'}`}>
                      <Activity className={`w-5 h-5 transition-colors ${pathname.startsWith('/tracker') ? 'text-emerald-700 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-500'}`} />
                    </div>
                    Tracker Dashboard
                  </Link>
                  <Link
                    href="/insight"
                    aria-current={pathname.startsWith('/insight') ? "page" : undefined}
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname.startsWith('/insight')
                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                        : 'text-slate-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/insight') ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-amber-50 dark:bg-amber-950/40'}`}>
                      <Lightbulb className={`w-5 h-5 transition-colors ${pathname.startsWith('/insight') ? 'text-amber-700 dark:text-amber-400' : 'text-amber-600 dark:text-amber-500'}`} />
                    </div>
                    Insights & Tips
                  </Link>
                  <Link
                    href="/achievement"
                    aria-current={pathname.startsWith('/achievement') ? "page" : undefined}
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname.startsWith('/achievement')
                        ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                        : 'text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/achievement') ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-indigo-50 dark:bg-indigo-950/40'}`}>
                      <Coins className={`w-5 h-5 transition-colors ${pathname.startsWith('/achievement') ? 'text-indigo-700 dark:text-indigo-400' : 'text-indigo-600 dark:text-indigo-500'}`} />
                    </div>
                    Achievements
                  </Link>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </nav>
  );
}
