"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Plus, X, TrainFront, Leaf, Zap } from 'lucide-react';
import { useEco } from '@/components/eco-provider';
import { CustomSelect } from '@/components/custom-select';

export default function QuickTracker() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isOpen, setIsOpen] = useState(false);
  const { addEmission, addLog } = useEco();

  const [category, setCategory] = useState('Transport');
  const [subCategory, setSubCategory] = useState('Public Transit (Bus/Train)');
  const [value, setValue] = useState('');

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update default subCategory when category changes
  useEffect(() => {
    if (category === 'Transport') setSubCategory('Public Transit (Bus/Train)');
    else if (category === 'Food') setSubCategory('Vegan Meal');
    else if (category === 'Energy') setSubCategory('Renewable Source (Solar/Wind)');
  }, [category]);

  const handleMacro = (macroCat: string, macroSub: string, macroVal: number, emission: number) => {
    addEmission(emission, macroCat);
    const unit = macroCat === 'Transport' ? 'km' : macroCat === 'Food' ? 'servings' : 'hrs';
    addLog({ 
      category: macroCat, 
      emission, 
      message: `Quick recorded ${macroCat} footprint: ${macroSub} (${macroVal} ${unit})` 
    });
    setIsOpen(false);
  };

  const handleQuickLog = () => {
    const numericValue = parseFloat(value) || 0;
    if (numericValue <= 0) return;

    let emission = 0;
    let unit = '';

    if (category === 'Transport') {
      unit = 'km';
      if (subCategory.includes('Bicycle')) {
        emission = 0;
      } else if (subCategory.includes('Public')) {
        emission = +(numericValue * 0.05).toFixed(1);
      } else if (subCategory.includes('Electric')) {
        emission = +(numericValue * 0.08).toFixed(1);
      } else {
        emission = +(numericValue * 0.2).toFixed(1);
      }
    } else if (category === 'Food') {
      unit = 'servings';
      if (subCategory.includes('Vegan')) {
        emission = +(numericValue * 0.5).toFixed(1);
      } else if (subCategory.includes('Vegetarian')) {
        emission = +(numericValue * 0.8).toFixed(1);
      } else if (subCategory.includes('Chicken')) {
        emission = +(numericValue * 1.5).toFixed(1);
      } else {
        emission = +(numericValue * 3.5).toFixed(1);
      }
    } else {
      unit = 'hrs';
      if (subCategory.includes('Renewable')) {
        emission = +(numericValue * 0.1).toFixed(1);
      } else if (subCategory.includes('Saving Mode')) {
        emission = +(numericValue * 0.3).toFixed(1);
      } else if (subCategory.includes('Unplugged')) {
        emission = 0;
      } else {
        emission = +(numericValue * 0.6).toFixed(1);
      }
    }

    addEmission(emission, category);
    addLog({ 
      category, 
      emission, 
      message: `Quick recorded ${category} footprint: ${subCategory} (${numericValue} ${unit})` 
    });
    setIsOpen(false);
    setValue('');
  };

  if (!mounted || pathname === '/tracker') return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        title="Quick Footprint (Ctrl+K)"
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-800 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-[90] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Popup */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-white dark:bg-slate-900">
              <label className="text-[14px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">Quick Footprint Record</label>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Quickly record an activity to track your carbon footprint.</div>
              
              {/* 1-Tap Quick Actions */}
              <div className="space-y-2 mb-4">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">1-Tap Quick Logs</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleMacro('Transport', 'Public Transit (Bus/Train)', 5, 0.3)} // 5km * 0.05
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-100/70 dark:border-blue-900/30 rounded text-[10px] font-semibold transition-all hover:scale-102 duration-200"
                  >
                    <TrainFront className="w-3.5 h-3.5" /> Metro (5km)
                  </button>
                  <button 
                    onClick={() => handleMacro('Food', 'Vegan Meal', 1, 0.5)} // 1srv * 0.5
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-100/70 dark:border-emerald-900/30 rounded text-[10px] font-semibold transition-all hover:scale-102 duration-200"
                  >
                    <Leaf className="w-3.5 h-3.5" /> Plant-Based (1 srv)
                  </button>
                  <button 
                    onClick={() => handleMacro('Energy', 'Unplugged Unused Devices', 8, 0)} // 8hr * 0
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/80 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-100/70 dark:border-amber-900/30 rounded text-[10px] font-semibold transition-all hover:scale-102 duration-200"
                  >
                    <Zap className="w-3.5 h-3.5" /> Unplug (8h)
                  </button>
                </div>
              </div>
 
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label htmlFor="category-select" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <CustomSelect 
                    id="category-select"
                    value={category}
                    onChange={setCategory}
                    options={['Transport', 'Food', 'Energy']}
                  />
                </div>
 
                <div>
                  <label htmlFor="subcategory-select" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    {category === 'Transport' ? 'Mode of Transport' : category === 'Food' ? 'Meal Type' : 'Energy Action'}
                  </label>
                  <CustomSelect 
                    id="subcategory-select"
                    value={subCategory}
                    onChange={setSubCategory}
                    options={
                      category === 'Transport' ? [
                        'Public Transit (Bus/Train)',
                        'Bicycle / Walking',
                        'Electric Vehicle',
                        'Gasoline Car'
                      ] : category === 'Food' ? [
                        'Vegan Meal',
                        'Vegetarian Meal',
                        'Chicken / Fish',
                        'Beef / Lamb (High Impact)'
                      ] : [
                        'Renewable Source (Solar/Wind)',
                        'Energy Saving Mode Used',
                        'Unplugged Unused Devices',
                        'Standard Grid Usage'
                      ]
                    }
                  />
                </div>
 
                <div>
                  <label htmlFor="value-input" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    {category === 'Transport' ? 'Distance (km)' : category === 'Food' ? 'Servings' : 'Duration (Hours)'}
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      id="value-input"
                      type="number" 
                      value={value}
                      autoFocus
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickLog();
                        }
                      }}
                      placeholder="0"
                      className="text-2xl py-3 pl-4 pr-16 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full font-bold text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 transition-colors shadow-inner bg-slate-50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800"
                    />
                    <span className="absolute right-4 text-sm font-bold text-slate-400 dark:text-slate-500">
                      {category === 'Transport' ? 'km' : category === 'Food' ? 'srv' : 'hrs'}
                    </span>
                  </div>
                </div>
              </div>
 
              <button
                onClick={handleQuickLog}
                disabled={!value || parseFloat(value) <= 0}
                className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Record Footprint
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
