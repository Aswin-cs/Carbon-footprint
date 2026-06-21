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
            <Link href="/tracker" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors">
              <Activity className="w-4 h-4" />
              Tracker
            </Link>
            <Link href="/acheivement" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors">
              <Coins className="w-4 h-4" />
              Achievements
            </Link>
            <Link href="/insight" className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-bold transition-colors">
              <Lightbulb className="w-4 h-4" />
              Insights
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
                  <Link href="/" className="flex items-center gap-4 text-lg font-bold text-slate-800 hover:text-emerald-600 transition-all w-full p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm active:scale-95">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    Home Dashboard
                  </Link>
                  <Link href="/tracker" className="flex items-center gap-4 text-lg font-bold text-slate-800 hover:text-emerald-600 transition-all w-full p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm active:scale-95">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    Tracker Dashboard
                  </Link>
                  <Link href="/economy" className="flex items-center gap-4 text-lg font-bold text-slate-800 hover:text-emerald-600 transition-all w-full p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm active:scale-95">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Coins className="w-5 h-5 text-indigo-600" />
                    </div>
                    Achievements
                  </Link>
                  <Link href="/insight" className="flex items-center gap-4 text-lg font-bold text-slate-800 hover:text-emerald-600 transition-all w-full p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm active:scale-95">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                    </div>
                    Insights & Tips
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
