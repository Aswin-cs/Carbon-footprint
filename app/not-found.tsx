"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Home, ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12">
      <title>404 - Lost in the Wilderness | Carbon Footprint Tracker</title>
      
      {/* 404 Icon Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative flex items-center justify-center mb-6"
      >
        {/* Soft pulsing green circle background */}
        <div className="absolute w-36 h-36 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
        
        {/* Main 404 compass icon container */}
        <div className="relative z-10 w-24 h-24 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-lg">
          <Compass className="w-12 h-12 text-emerald-600 animate-[spin_10s_linear_infinite]" />
        </div>
      </motion.div>

      {/* Main heading */}
      <h1 className="text-5xl font-black text-slate-800 tracking-tight">
        404
      </h1>
      
      <h2 className="text-lg sm:text-xl font-bold text-slate-700 mt-2 tracking-tight">
        Lost in the Wilderness
      </h2>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-500 mt-3 max-w-sm leading-relaxed">
        Oops! The path you've chosen doesn't exist or has evaporated. Let's redirect your carbon-neutral journey back onto the right track.
      </p>

      {/* Action Buttons */}
      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-xs sm:max-w-none justify-center"
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs font-bold hover:bg-slate-50 hover:border-slate-350 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </Link>
      </motion.div>

      {/* Mini trivia / tip card */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-12 p-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl flex gap-3 items-start text-left max-w-sm"
      >
        <Leaf className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Eco Tip</span>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
            Did you know? Running a web search produces about 0.2g of CO2e. Navigating directly to your dashboard helps save tiny amounts of energy!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
