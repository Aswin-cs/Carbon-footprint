"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
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
      message: `Quick logged ${category}: ${subCategory} (${numericValue} ${unit})` 
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
        title="Quick Log (Ctrl+K)"
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-[90] focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Popup */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <label className="text-[14px] font-bold text-slate-800 tracking-tight">Quick Log Activity</label>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="text-sm text-slate-500 mb-2">Quickly log an activity to track your impact.</div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
                  <CustomSelect 
                    value={category}
                    onChange={setCategory}
                    options={['Transport', 'Food', 'Energy']}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    {category === 'Transport' ? 'Mode of Transport' : category === 'Food' ? 'Meal Type' : 'Energy Action'}
                  </label>
                  <CustomSelect 
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
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    {category === 'Transport' ? 'Distance (km)' : category === 'Food' ? 'Servings' : 'Duration (Hours)'}
                  </label>
                  <div className="relative flex items-center">
                    <input 
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
                      className="text-2xl py-3 pl-4 pr-16 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 w-full font-bold text-slate-800 placeholder-slate-300 transition-colors shadow-inner bg-slate-50 focus:bg-white"
                    />
                    <span className="absolute right-4 text-sm font-bold text-slate-400">
                      {category === 'Transport' ? 'km' : category === 'Food' ? 'srv' : 'hrs'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleQuickLog}
                disabled={!value || parseFloat(value) <= 0}
                className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Log Impact
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
