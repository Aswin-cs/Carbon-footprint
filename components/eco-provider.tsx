"use client";
import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Zod Schemas for strict runtime validation
const LimitSchema = z.number().positive("Limit must be positive");
const LogEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  category: z.string(),
  emission: z.number().nonnegative(),
  message: z.string(),
});
const LogsSchema = z.array(LogEntrySchema);
const WeeklyEmissionSchema = z.array(z.object({ name: z.string(), emissions: z.number().nonnegative() }));
const CategoryEmissionSchema = z.array(z.object({ name: z.string(), value: z.number().nonnegative() }));
const RewardsSchema = z.array(z.string());
const BadgesMapSchema = z.record(z.string());

// Helper to safely sanitize text on both server and client
const sanitize = (text: string) => {
  if (typeof window === 'undefined') return text;
  return DOMPurify.sanitize(text);
};

export type LogEntry = {
  id: string;
  date: string;
  category: string;
  emission: number;
  message: string;
};

type EcoContextType = {
  weeklyEmissions: { name: string; emissions: number }[];
  categoryEmissions: { name: string; value: number }[];
  addEmission: (val: number, category: string) => void;
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'date'>) => void;
  deleteLog: (id: string) => void;
  deleteLogs: (ids: string[]) => void;
  dailyLimit: number;
  setDailyLimit: (val: number) => void;
  redeemedRewards: string[];
  redeemReward: (id: string) => void;
  currentStreak: number;
  earnedBadgesMap: Record<string, string>;
};

const defaultWeeklyEmissions = [
  { name: 'Mon', emissions: 0 },
  { name: 'Tue', emissions: 0 },
  { name: 'Wed', emissions: 0 },
  { name: 'Thu', emissions: 0 },
  { name: 'Fri', emissions: 0 },
  { name: 'Sat', emissions: 0 },
  { name: 'Sun', emissions: 0 },
];

const defaultCategoryEmissions = [
  { name: 'Transport', value: 0 },
  { name: 'Food', value: 0 },
  { name: 'Energy', value: 0 },
];

const EcoContext = createContext<EcoContextType>({
  weeklyEmissions: defaultWeeklyEmissions,
  categoryEmissions: defaultCategoryEmissions,
  addEmission: () => { },
  logs: [],
  addLog: () => { },
  deleteLog: () => { },
  deleteLogs: () => { },
  dailyLimit: 30,
  setDailyLimit: () => { },
  redeemedRewards: [],
  redeemReward: () => { },
  currentStreak: 0,
  earnedBadgesMap: {},
});

export const useEco = () => useContext(EcoContext);

const BADGE_DETAILS: Record<string, { name: string; desc: string }> = {
  'act_1': { name: 'First Step', desc: 'Record your first carbon footprint' },
  'act_10': { name: 'Consistency', desc: 'Record 10 carbon footprints' },
  'streak_1': { name: 'Daily Starter', desc: 'Complete 1-day eco streak' },
  'streak_3': { name: 'Habit Builder', desc: 'Complete 3-day eco streak' },
  'streak_7': { name: 'Eco Champion', desc: 'Complete 7-day eco streak' },
  'tree_planter': { name: 'Tree Planter', desc: 'Support a tree planting initiative' },
  'eco_warrior': { name: 'Eco Warrior', desc: 'Reach Carbon Neutral status' },
};

export function EcoProvider({ children }: { children: React.ReactNode }) {
  const [weeklyEmissions, setWeeklyEmissions] = useState(defaultWeeklyEmissions);
  const [categoryEmissions, setCategoryEmissions] = useState(defaultCategoryEmissions);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dailyLimit, setDailyLimitState] = useState(30);

  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const [earnedBadgesMap, setEarnedBadgesMap] = useState<Record<string, string>>({});

  const [initialized, setInitialized] = useState(false);
  const [deletedLogsState, setDeletedLogsState] = useState<LogEntry[] | null>(null);
  const undoTimeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    try {
      const savedLimit = localStorage.getItem('dailyLimit');
      if (savedLimit) {
        const result = LimitSchema.safeParse(Number(savedLimit));
        if (result.success) setDailyLimitState(result.data);
      }

      const savedLogs = localStorage.getItem('eco_logs');
      if (savedLogs) {
        try {
          const result = LogsSchema.safeParse(JSON.parse(savedLogs));
          if (result.success) setLogs(result.data);
        } catch(e) {}
      }

      const savedWeekly = localStorage.getItem('eco_weekly');
      if (savedWeekly) {
        try {
          const result = WeeklyEmissionSchema.safeParse(JSON.parse(savedWeekly));
          if (result.success) setWeeklyEmissions(result.data);
        } catch(e) {}
      }

      const savedCategory = localStorage.getItem('eco_category');
      if (savedCategory) {
        try {
          const result = CategoryEmissionSchema.safeParse(JSON.parse(savedCategory));
          if (result.success) setCategoryEmissions(result.data);
        } catch(e) {}
      }

      const savedRewards = localStorage.getItem('eco_rewards');
      if (savedRewards) {
        try {
          const result = RewardsSchema.safeParse(JSON.parse(savedRewards));
          if (result.success) setRedeemedRewards(result.data);
        } catch(e) {}
      }

      const savedBadgesMap = localStorage.getItem('eco_badges_map');
      if (savedBadgesMap) {
        try {
          const result = BadgesMapSchema.safeParse(JSON.parse(savedBadgesMap));
          if (result.success) setEarnedBadgesMap(result.data);
        } catch(e) {}
      }
    } catch (e) {
      console.error('Failed to load storage', e);
    } finally {
      setInitialized(true);
    }
  }, []);

  React.useEffect(() => { if (initialized) localStorage.setItem('eco_logs', JSON.stringify(logs)); }, [logs, initialized]);
  React.useEffect(() => { if (initialized) localStorage.setItem('eco_weekly', JSON.stringify(weeklyEmissions)); }, [weeklyEmissions, initialized]);
  React.useEffect(() => { if (initialized) localStorage.setItem('eco_category', JSON.stringify(categoryEmissions)); }, [categoryEmissions, initialized]);
  React.useEffect(() => { if (initialized) localStorage.setItem('eco_rewards', JSON.stringify(redeemedRewards)); }, [redeemedRewards, initialized]);
  React.useEffect(() => { if (initialized) localStorage.setItem('eco_badges_map', JSON.stringify(earnedBadgesMap)); }, [earnedBadgesMap, initialized]);

  const setDailyLimit = (val: number) => {
    if (val <= 0 || isNaN(val)) return; // Prevent setting negative or invalid limit
    setDailyLimitState(val);
    localStorage.setItem('dailyLimit', val.toString());
  };

  const [recentBadge, setRecentBadge] = useState<string | null>(null);
  const prevEarnedRef = React.useRef<string[]>([]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayEmissions = weeklyEmissions.find(e => e.name === today)?.emissions || 0;

  const initialMountRef = React.useRef(true);
  const [notifiedLimit, setNotifiedLimit] = useState(false);
  const [notifiedHigh, setNotifiedHigh] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{ type: 'limit' | 'high', title: string, desc: string } | null>(null);

  const triggerFlash = () => {
    const el = document.getElementById('page-wrapper') || document.body;
    el.classList.remove('animate-flash-orange');
    void el.offsetWidth; // flush layout
    el.classList.add('animate-flash-orange');
    setTimeout(() => {
      if (el) el.classList.remove('animate-flash-orange');
    }, 2000);
  };

  React.useEffect(() => {
    if (initialMountRef.current) {
      if (todayEmissions >= dailyLimit) setNotifiedLimit(true);
      if (todayEmissions >= 55) setNotifiedHigh(true);
      initialMountRef.current = false;
      return;
    }

    if (todayEmissions >= 55 && !notifiedHigh) {
      setActiveAlert({ type: 'high', title: 'High Emissions Alert', desc: 'Your daily emissions have crossed 55 kg.' });
      setNotifiedHigh(true);
      triggerFlash();
      const t = setTimeout(() => setActiveAlert(null), 3000);
      return () => clearTimeout(t);
    } else if (todayEmissions >= dailyLimit && !notifiedLimit) {
      setActiveAlert({ type: 'limit', title: 'Daily Limit Reached', desc: `You've reached your daily limit of ${dailyLimit} kg CO2e.` });
      setNotifiedLimit(true);
      triggerFlash();
      const t = setTimeout(() => setActiveAlert(null), 3000);
      return () => clearTimeout(t);
    }
  }, [todayEmissions, dailyLimit, notifiedHigh, notifiedLimit]);

  const currentStreak = React.useMemo(() => {
    if (logs.length === 0) return 0;

    const dates = logs.map(l => new Date(l.date).toLocaleDateString('en-US'));
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (uniqueDates.length > 0) {
      const mostRecentLogDate = new Date(uniqueDates[0]);
      mostRecentLogDate.setHours(0, 0, 0, 0);

      if (mostRecentLogDate.getTime() === today.getTime() || mostRecentLogDate.getTime() === yesterday.getTime()) {
        let currentDate = mostRecentLogDate;
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const d = new Date(uniqueDates[i]);
          d.setHours(0, 0, 0, 0);

          const expectedNextDate = new Date(currentDate);
          expectedNextDate.setDate(expectedNextDate.getDate() - 1);

          if (d.getTime() === expectedNextDate.getTime()) {
            streak++;
            currentDate = d;
          } else {
            break;
          }
        }
      }
    }
    return streak;
  }, [logs]);

  const earnedBadges = [
    logs.length >= 1 ? 'act_1' : null,
    logs.length >= 10 ? 'act_10' : null,
    currentStreak >= 1 ? 'streak_1' : null,
    currentStreak >= 3 ? 'streak_3' : null,
    currentStreak >= 7 ? 'streak_7' : null,
    redeemedRewards.includes('tree_1') ? 'tree_planter' : null,
  ].filter(Boolean) as string[];

  React.useEffect(() => {
    const initialRun = prevEarnedRef.current.length === 0 && earnedBadges.length > 0;
    const newlyEarned = earnedBadges.filter(id => !prevEarnedRef.current.includes(id));

    let mapUpdated = false;
    const newMap = { ...earnedBadgesMap };

    // Fill in timestamps for newly earned or un-recorded badges
    earnedBadges.forEach(badgeId => {
      if (!newMap[badgeId]) {
        // Find if this is newly earned or just missing
        // Could look at logs, but simplified to now for now
        newMap[badgeId] = new Date().toISOString();
        mapUpdated = true;
      }
    });

    if (!initialRun && newlyEarned.length > 0) {
      setRecentBadge(newlyEarned[0]);
      triggerFlash();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#fbbf24', '#f59e0b']
      });

      const timer = setTimeout(() => setRecentBadge(null), 5000);
      prevEarnedRef.current = earnedBadges;
      if (mapUpdated) setEarnedBadgesMap(newMap);
      return () => clearTimeout(timer);
    }
    prevEarnedRef.current = earnedBadges;
    if (mapUpdated) setEarnedBadgesMap(newMap);
  }, [earnedBadges.join(',')]);

  const addEmission = (val: number, category: string) => {
    if (typeof val !== 'number' || val < 0 || isNaN(val)) return; // Prevent negative emission injection
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    setWeeklyEmissions(prev => {
      const newData = [...prev];
      const todayIndex = newData.findIndex(d => d.name === today);
      if (todayIndex !== -1) {
        newData[todayIndex] = { ...newData[todayIndex], emissions: newData[todayIndex].emissions + val };
      } else {
        const lastIndex = newData.length - 1;
        newData[lastIndex] = { ...newData[lastIndex], emissions: newData[lastIndex].emissions + val };
      }
      return newData;
    });
    setCategoryEmissions(prev => {
      const newData = [...prev];
      const catKey = category === 'Transportation' ? 'Transport' : category;
      const catIndex = newData.findIndex(c => c.name === catKey);
      if (catIndex !== -1) {
        newData[catIndex] = { ...newData[catIndex], value: +(newData[catIndex].value + val).toFixed(1) };
      }
      return newData;
    });
  };
  const addLog = (log: Omit<LogEntry, 'id' | 'date'>) => {
    const newLog: LogEntry = {
      ...log,
      message: sanitize(log.message),
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const deleteLog = (id: string) => {
    const logToDelete = logs.find(l => l.id === id);
    if (!logToDelete) return;

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setDeletedLogsState([logToDelete]);
    undoTimeoutRef.current = setTimeout(() => {
      setDeletedLogsState(null);
    }, 5000);

    setLogs(prev => prev.filter(log => log.id !== id));

    const logDate = new Date(logToDelete.date).toLocaleDateString('en-US', { weekday: 'short' });

    setWeeklyEmissions(prev => {
      const newData = [...prev];
      const dayIndex = newData.findIndex(d => d.name === logDate);
      if (dayIndex !== -1) {
        newData[dayIndex] = { ...newData[dayIndex], emissions: Math.max(0, newData[dayIndex].emissions - logToDelete.emission) };
      }
      return newData;
    });

    setCategoryEmissions(prev => {
      const newData = [...prev];
      const catKey = logToDelete.category === 'Transportation' ? 'Transport' : logToDelete.category;
      const catIndex = newData.findIndex(c => c.name === catKey);
      if (catIndex !== -1) {
        newData[catIndex] = { ...newData[catIndex], value: Math.max(0, +(newData[catIndex].value - logToDelete.emission).toFixed(1)) };
      }
      return newData;
    });
  };

  const undoDeleteLog = () => {
    if (!deletedLogsState || deletedLogsState.length === 0) return;

    const logsToRestore = deletedLogsState;

    setLogs(prev => {
      const newLogs = [...logsToRestore, ...prev];
      newLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return newLogs.slice(0, 50);
    });

    setWeeklyEmissions(prev => {
      const newData = [...prev];
      logsToRestore.forEach(log => {
        const val = log.emission;
        const logDate = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' });
        const todayIndex = newData.findIndex(d => d.name === logDate);
        if (todayIndex !== -1) {
          newData[todayIndex] = { ...newData[todayIndex], emissions: newData[todayIndex].emissions + val };
        } else {
          const lastIndex = newData.length - 1;
          newData[lastIndex] = { ...newData[lastIndex], emissions: newData[lastIndex].emissions + val };
        }
      });
      return newData;
    });

    setCategoryEmissions(prev => {
      const newData = [...prev];
      logsToRestore.forEach(log => {
        const val = log.emission;
        const category = log.category;
        const catKey = category === 'Transportation' ? 'Transport' : category;
        const catIndex = newData.findIndex(c => c.name === catKey);
        if (catIndex !== -1) {
          newData[catIndex] = { ...newData[catIndex], value: +(newData[catIndex].value + val).toFixed(1) };
        }
      });
      return newData;
    });

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setDeletedLogsState(null);
  };

  const deleteLogs = (ids: string[]) => {
    const logsToDelete = logs.filter(l => ids.includes(l.id));
    if (logsToDelete.length === 0) return;

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setDeletedLogsState(logsToDelete);
    undoTimeoutRef.current = setTimeout(() => {
      setDeletedLogsState(null);
    }, 5000);

    setLogs(prev => prev.filter(log => !ids.includes(log.id)));

    setWeeklyEmissions(prev => {
      const newData = [...prev];
      logsToDelete.forEach(logToDelete => {
        const logDate = new Date(logToDelete.date).toLocaleDateString('en-US', { weekday: 'short' });
        const dayIndex = newData.findIndex(d => d.name === logDate);
        if (dayIndex !== -1) {
          newData[dayIndex] = { ...newData[dayIndex], emissions: Math.max(0, newData[dayIndex].emissions - logToDelete.emission) };
        }
      });
      return newData;
    });

    setCategoryEmissions(prev => {
      const newData = [...prev];
      logsToDelete.forEach(logToDelete => {
        const catKey = logToDelete.category === 'Transportation' ? 'Transport' : logToDelete.category;
        const catIndex = newData.findIndex(c => c.name === catKey);
        if (catIndex !== -1) {
          newData[catIndex] = { ...newData[catIndex], value: Math.max(0, +(newData[catIndex].value - logToDelete.emission).toFixed(1)) };
        }
      });
      return newData;
    });

  };

  const redeemReward = (id: string) => {
    if (!redeemedRewards.includes(id)) {
      setRedeemedRewards(prev => [...prev, id]);
    }
  };

  return (
    <EcoContext.Provider value={{ weeklyEmissions, categoryEmissions, addEmission, logs, addLog, deleteLog, deleteLogs, dailyLimit, setDailyLimit, redeemedRewards, redeemReward, currentStreak, earnedBadgesMap }}>
      {children}
      <AnimatePresence>
        {recentBadge && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-xl rounded-lg p-4 flex items-center gap-4 z-50 max-w-sm"
          >
            <div className="bg-emerald-100 dark:bg-emerald-950/40 p-2 rounded-full text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Badge Unlocked!</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{BADGE_DETAILS[recentBadge].name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{BADGE_DETAILS[recentBadge].desc}</p>
            </div>
            <button onClick={() => setRecentBadge(null)} className="absolute top-2 right-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeAlert && (
          <div className="fixed top-20 left-0 right-0 z-[150] flex justify-center px-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.8 }}
              className={`pointer-events-auto bg-gradient-to-br border shadow-xl rounded-2xl p-4.5 flex items-center gap-4 max-w-sm w-full relative ${
                activeAlert.type === 'high' 
                  ? 'from-rose-50 to-red-50/50 border-rose-200 dark:from-rose-950/20 dark:to-red-950/10 dark:border-rose-900/30' 
                  : 'from-amber-50 to-orange-50/50 border-amber-200 dark:from-amber-950/20 dark:to-orange-950/10 dark:border-amber-900/30'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 shadow-inner ${
                activeAlert.type === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
              }`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle w-5 h-5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <div className="flex-1 pr-4">
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                   activeAlert.type === 'high' ? 'text-rose-600' : 'text-amber-600'
                }`}>Alert</p>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeAlert.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{activeAlert.desc}</p>
              </div>
              <button 
                onClick={() => setActiveAlert(null)} 
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all duration-200"
                title="Close alert"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-3.5 h-3.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deletedLogsState && deletedLogsState.length > 0 && (
          <motion.div
            key="undo-toast"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 md:bottom-6 left-0 right-0 z-[120] px-4 flex justify-center pointer-events-none"
          >
            <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-xl py-3 px-5 flex items-center justify-between gap-4 pointer-events-auto w-full max-w-sm">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{deletedLogsState.length > 1 ? `${deletedLogsState.length} footprints deleted` : 'Footprint deleted'}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {deletedLogsState.length > 1
                    ? `${deletedLogsState.reduce((acc, log) => acc + log.emission, 0).toFixed(1)} kg CO₂e combined`
                    : `${deletedLogsState[0].category} • ${deletedLogsState[0].emission} kg`
                  }
                </p>
              </div>
              <button
                onClick={undoDeleteLog}
                className="text-xs font-bold text-emerald-400 hover:text-white uppercase tracking-wide bg-emerald-400/10 hover:bg-emerald-500 transition-all px-4 py-2 rounded-lg shrink-0"
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </EcoContext.Provider>
  );
}
