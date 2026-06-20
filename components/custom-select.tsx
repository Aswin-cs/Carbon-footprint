"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function CustomSelect({ value, onChange, options, placeholder, size = 'default' }: CustomSelectProps & { size?: 'small' | 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between transition-all focus:outline-none ${
          size === 'small' 
            ? "px-2.5 py-1.5 border rounded-md text-xs font-semibold" 
            : "px-3 py-2.5 border-2 rounded-lg text-sm font-medium"
        } ${
          isOpen 
            ? "border-emerald-500 bg-white shadow-sm" 
            : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200"
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-100 rounded-lg shadow-xl overflow-hidden origin-top"
          >
            <ul className="max-h-60 overflow-y-auto py-1.5 scrollbar-thin scrollbar-thumb-slate-200">
              {options.map((option) => (
                <li key={option} className="px-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-md ${
                      value === option 
                        ? "bg-emerald-50 text-emerald-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
