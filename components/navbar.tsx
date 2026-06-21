"use client";
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Menu, Activity, Coins, X, Home, Lightbulb } from 'lucide-react';
import { useEco } from '@/components/eco-provider';
import Image from 'next/image';

export default function NavBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { } = useEco();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
              href="/acheivement"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname.startsWith('/acheivement')
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-700/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Coins className="w-4 h-4" />
              Achievements
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative" ref={menuRef}>
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
              <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <label className="text-[14px] font-bold text-slate-800 tracking-tight">Navigation</label>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-3 p-6 bg-slate-50/50">
                  <Link
                    href="/"
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname === '/'
                        ? 'text-blue-700 bg-blue-50/50 border-blue-200'
                        : 'text-slate-800 hover:text-blue-600 bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname === '/' ? 'bg-blue-100' : 'bg-blue-50'}`}>
                      <Home className={`w-5 h-5 transition-colors ${pathname === '/' ? 'text-blue-700' : 'text-blue-600'}`} />
                    </div>
                    Home Dashboard
                  </Link>
                  <Link
                    href="/tracker"
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname.startsWith('/tracker')
                        ? 'text-emerald-700 bg-emerald-50/50 border-emerald-200'
                        : 'text-slate-800 hover:text-emerald-600 bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/tracker') ? 'bg-emerald-100' : 'bg-emerald-50'}`}>
                      <Activity className={`w-5 h-5 transition-colors ${pathname.startsWith('/tracker') ? 'text-emerald-700' : 'text-emerald-600'}`} />
                    </div>
                    Tracker Dashboard
                  </Link>
                  <Link
                    href="/insight"
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname.startsWith('/insight')
                        ? 'text-amber-700 bg-amber-50/50 border-amber-200'
                        : 'text-slate-800 hover:text-amber-600 bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/insight') ? 'bg-amber-100' : 'bg-amber-50'}`}>
                      <Lightbulb className={`w-5 h-5 transition-colors ${pathname.startsWith('/insight') ? 'text-amber-700' : 'text-amber-600'}`} />
                    </div>
                    Insights & Tips
                  </Link>
                  <Link
                    href="/acheivement"
                    className={`flex items-center gap-4 text-lg font-bold transition-all w-full p-4 rounded-xl border shadow-sm active:scale-95 ${
                      pathname.startsWith('/acheivement')
                        ? 'text-indigo-700 bg-indigo-50/50 border-indigo-200'
                        : 'text-slate-800 hover:text-indigo-600 bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/acheivement') ? 'bg-indigo-100' : 'bg-indigo-50'}`}>
                      <Coins className={`w-5 h-5 transition-colors ${pathname.startsWith('/acheivement') ? 'text-indigo-700' : 'text-indigo-600'}`} />
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
