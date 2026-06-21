"use client";

import { TrackerForm } from '@/components/tracker-form';

export default function Tracker() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-400 transition-colors duration-500">Carbon Tracker</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 transition-colors duration-500 mb-3">Record your daily activities to track your carbon footprint.</p>
        </div>
      </div>
      
      <TrackerForm />
    </div>
  );
}
