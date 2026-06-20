"use client";

import { useState, useEffect, useMemo } from 'react';
import { useEco, LogEntry } from '@/components/eco-provider';
import { Lightbulb, Info, ArrowRight, Leaf, Zap, Car, Utensils, Globe, HelpCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const AWARENESS_INFO = {
  plant: {
    title: "🌱 Indoor Flora",
    thriving: "Houseplants absorb carbon dioxide and release fresh oxygen, cleaning your indoor air.",
    arid: "Without water and under high carbon stress, houseplants wilt and lose their air-purifying power."
  },
  tree: {
    title: "🌳 Canopy Power",
    thriving: "A single mature tree absorbs about 22kg of CO2 per year. Forests are our planet's lungs.",
    arid: "Deforestation and high temperatures turn trees dry, releasing stored carbon back into the atmosphere."
  },
  flower: {
    title: "🌸 Ecosystem Link",
    thriving: "Wildflowers support pollinators like bees and butterflies, preserving biodiversity.",
    arid: "Rising temperatures disrupt blooming seasons, causing flowers to dry up and threatening ecosystems."
  }
};

const CAT_THEMES = {
  Transport: {
    bg: 'bg-gradient-to-br from-blue-50/70 to-slate-50/40 dark:from-blue-950/15 dark:to-slate-900/10',
    border: 'border-blue-100/80 dark:border-blue-900/30',
    hover: 'hover:border-blue-200 dark:hover:border-blue-800/50',
    text: 'text-blue-800 dark:text-blue-300',
    badge: 'bg-blue-100/60 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    icon: Car,
  },
  Food: {
    bg: 'bg-gradient-to-br from-emerald-50/70 to-slate-50/40 dark:from-emerald-950/15 dark:to-slate-900/10',
    border: 'border-emerald-100/80 dark:border-emerald-900/30',
    hover: 'hover:border-emerald-200 dark:hover:border-emerald-800/50',
    text: 'text-emerald-800 dark:text-emerald-300',
    badge: 'bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    icon: Utensils,
  },
  Energy: {
    bg: 'bg-gradient-to-br from-amber-50/70 to-slate-50/40 dark:from-amber-950/15 dark:to-slate-900/10',
    border: 'border-amber-100/80 dark:border-amber-900/30',
    hover: 'hover:border-amber-200 dark:hover:border-amber-800/50',
    text: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-100/60 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    icon: Zap,
  },
  General: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20',
    border: 'border-slate-200/60 dark:border-slate-800/40',
    hover: 'hover:border-slate-300 dark:hover:border-slate-700/50',
    text: 'text-slate-800 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    icon: Leaf,
  }
};

const TAB_DATA = {
  transport: {
    infoTitle: "Car vs Public Transit Footprints",
    infoText: "Driving a standard gasoline car generates ~200g of CO2 per km. Public transit reduces this footprint by 75% to 50g per km. Bicycling emits zero carbon!",
    pledges: [
      { id: 'trans_1', text: 'Commit to carpooling at least once a week' },
      { id: 'trans_2', text: 'Swap a short drive (<3km) with cycling or walking' },
      { id: 'trans_3', text: 'Take a bus or train for my daily commute' },
      { id: 'trans_4', text: 'Maintain correct tyre pressures to improve mpg by 3%' }
    ]
  },
  food: {
    infoTitle: "Emissions on Your Plate",
    infoText: "Food footprint accounts for over 25% of global emissions. A beef serving emits 3.5kg CO2e, while a plant-based serving produces only 0.5kg (a 7x reduction).",
    pledges: [
      { id: 'food_1', text: 'Commit to one fully plant-based meal daily' },
      { id: 'food_2', text: 'Participate in Meatless Mondays' },
      { id: 'food_3', text: 'Reduce food waste by planning meal portions' },
      { id: 'food_4', text: 'Purchase locally grown produce when possible' }
    ]
  },
  energy: {
    infoTitle: "Phantom Power Drain",
    infoText: "Standby power draws up to 10% of home electricity. Unplugging TV consoles, chargers, and kitchen appliances eliminates this hidden carbon source.",
    pledges: [
      { id: 'en_1', text: 'Unplug devices when not in active use' },
      { id: 'en_2', text: 'Use energy-saving eco modes on appliances' },
      { id: 'en_3', text: 'Turn off lights when leaving unoccupied rooms' },
      { id: 'en_4', text: 'Switch home lightbulbs to high-efficiency LEDs' }
    ]
  }
};

export default function InsightPage() {
  const { logs, categoryEmissions, weeklyEmissions } = useEco();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'transport' | 'food' | 'energy'>('transport');
  const [pledges, setPledges] = useState<Record<string, boolean>>({});
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [hoveredObject, setHoveredObject] = useState<'plant' | 'tree' | 'flower' | null>(null);
  const [isBiosphereHidden, setIsBiosphereHidden] = useState(true);



  useEffect(() => {
    setMounted(true);
    // Load pledges from localStorage
    const savedPledges = localStorage.getItem('eco_pledges');
    if (savedPledges) {
      try {
        setPledges(JSON.parse(savedPledges));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePledgeToggle = (pledgeId: string) => {
    const nextPledges = { ...pledges, [pledgeId]: !pledges[pledgeId] };
    setPledges(nextPledges);
    localStorage.setItem('eco_pledges', JSON.stringify(nextPledges));
  };

  const hasRealData = logs.length > 0;

  // Reconstruct mock logs if user has no logs to show relevant statistics
  const displayLogs = useMemo(() => {
    if (hasRealData) return logs;
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const fake: LogEntry[] = [];
    dayLabels.forEach((dayLabel, idx) => {
      const val = dayLabel.charCodeAt(0);
      fake.push({
        id: `mock-${idx}-1`,
        date: new Date(Date.now() - (6 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Transport',
        emission: +(10 + (val % 5) * 5.2).toFixed(1),
        message: 'Sample Transport activity',
      });
      fake.push({
        id: `mock-${idx}-2`,
        date: new Date(Date.now() - (6 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Food',
        emission: +(15 + (val % 3) * 4.8).toFixed(1),
        message: 'Sample Food activity',
      });
    });
    return fake;
  }, [logs, hasRealData]);

  // Compute calculated metrics
  const stats = useMemo(() => {
    let transportSum = 0;
    let foodSum = 0;
    let energySum = 0;

    displayLogs.forEach(l => {
      const cat = l.category;
      if (cat === 'Transport' || cat === 'Transportation') {
        transportSum += l.emission;
      } else if (cat === 'Food') {
        foodSum += l.emission;
      } else if (cat === 'Energy') {
        energySum += l.emission;
      }
    });

    const total = transportSum + foodSum + energySum;
    const maxVal = Math.max(transportSum, foodSum, energySum);
    let highestCat = 'General';
    let highestColor = 'text-emerald-600 bg-emerald-50';
    if (maxVal > 0) {
      if (maxVal === transportSum) {
        highestCat = 'Transport';
        highestColor = 'text-blue-600 bg-blue-50';
      }
      else if (maxVal === foodSum) {
        highestCat = 'Food';
        highestColor = 'text-emerald-600 bg-emerald-50';
      }
      else {
        highestCat = 'Energy';
        highestColor = 'text-amber-600 bg-amber-50';
      }
    }

    // Average daily emissions
    const dailyAvg = +(total / 7).toFixed(1);

    return {
      total: +total.toFixed(1),
      transport: +transportSum.toFixed(1),
      food: +foodSum.toFixed(1),
      energy: +energySum.toFixed(1),
      highestCat,
      highestColor,
      dailyAvg
    };
  }, [displayLogs]);

  const [biosphereView, setBiosphereView] = useState<'today' | 'weekly'>('weekly');

  // Compute today's emissions
  const todayEmissions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let sum = 0;
    displayLogs.forEach(l => {
      const logDate = l.date.split('T')[0];
      if (logDate === todayStr) {
        sum += l.emission;
      }
    });
    return +sum.toFixed(1);
  }, [displayLogs]);

  const isEmissionHigh = biosphereView === 'today' ? todayEmissions > 50.0 : stats.dailyAvg > 40.0;

  const categoryTheme = useMemo(() => {
    const cat = stats.highestCat as keyof typeof CAT_THEMES;
    return CAT_THEMES[cat] || CAT_THEMES.General;
  }, [stats.highestCat]);

  const activeTabTheme = useMemo(() => {
    if (activeTab === 'transport') {
      return {
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/50',
        progress: 'bg-blue-500',
        border: 'border-blue-200/50 dark:border-blue-900/30',
        activeLabelBg: 'bg-blue-50/30 dark:bg-blue-950/10',
        activeInput: 'text-blue-600 focus:ring-blue-500',
        label: 'Transport Pledges'
      };
    } else if (activeTab === 'food') {
      return {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        progress: 'bg-emerald-500',
        border: 'border-emerald-200/50 dark:border-emerald-900/30',
        activeLabelBg: 'bg-emerald-50/30 dark:bg-emerald-950/10',
        activeInput: 'text-emerald-600 focus:ring-emerald-500',
        label: 'Diet Pledges'
      };
    } else {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        progress: 'bg-amber-500',
        border: 'border-amber-200/50 dark:border-amber-900/30',
        activeLabelBg: 'bg-amber-50/30 dark:bg-amber-950/10',
        activeInput: 'text-amber-600 focus:ring-amber-500',
        label: 'Energy Pledges'
      };
    }
  }, [activeTab]);

  const tabPledges = useMemo(() => {
    if (activeTab === 'transport') {
      return ['trans_1', 'trans_2', 'trans_3', 'trans_4'];
    } else if (activeTab === 'food') {
      return ['food_1', 'food_2', 'food_3', 'food_4'];
    } else {
      return ['en_1', 'en_2', 'en_3', 'en_4'];
    }
  }, [activeTab]);

  const completedPledgesCount = useMemo(() => {
    return tabPledges.filter(id => pledges[id]).length;
  }, [tabPledges, pledges]);

  // Trivia slide content
  const TRIVIA = [
    {
      title: "Vampire Power",
      fact: "Devices on standby (vampire load) still consume up to 10% of standard home electricity. Unplugging chargers and TV consoles is the easiest zero-cost carbon reduction action.",
      stat: "10%",
      statDesc: "of home power load"
    },
    {
      title: "The Diet Factor",
      fact: "Red meat production generates 10x to 50x the greenhouse gas emissions of equivalent plant-based protein like beans, peas, and lentils. Replacing red meat with vegetables just one day a week saves ~300 kg CO2e a year.",
      stat: "10-50x",
      statDesc: "carbon intensity of legumes"
    },
    {
      title: "Aviation vs Public Transit",
      fact: "Taking a domestic flight is the single fastest way to spike your carbon footprint. A single passenger flying coach emits more carbon than taking a train for 20,000 kilometers.",
      stat: "20,000km",
      statDesc: "train travel equivalent"
    },
    {
      title: "Forest Power",
      fact: "A single mature tree absorbs roughly 22 kilograms (48 lbs) of carbon dioxide annually, releasing vital oxygen in return. It takes about 200 trees to offset an average individual's annual emissions.",
      stat: "22 kg",
      statDesc: "CO2 absorbed per tree annually"
    }
  ];

  const nextTrivia = () => {
    setTriviaIndex((prev) => (prev + 1) % TRIVIA.length);
  };

  const prevTrivia = () => {
    setTriviaIndex((prev) => (prev - 1 + TRIVIA.length) % TRIVIA.length);
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-[#fafafc] dark:bg-[#0f172a] transition-colors duration-500">
        {/* Subtle glowing backdrop element */}
        <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 dark:bg-emerald-400/5 blur-3xl animate-pulse pointer-events-none" />
        
        <div className="relative flex flex-col items-center">
          {/* Logo Icon container with pulse and spring bounce effects */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center shadow-md border border-emerald-100/50 dark:border-emerald-900/30 mb-4"
          >
            <Image src="/logo.svg" alt="Carbon Footprint Tracker Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            <div className="absolute inset-0 border-2 border-emerald-400/30 dark:border-emerald-500/20 rounded-2xl animate-ping opacity-75" />
          </motion.div>

          {/* Text labels */}
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase">
            Carbon Footprint Tracker
          </h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest animate-pulse">
            Calibrating Biosphere...
          </p>

          {/* Progress track using Framer Motion */}
          <div className="w-36 bg-slate-100 dark:bg-slate-800/80 rounded-full h-1 mt-4 overflow-hidden relative shadow-inner">
            <motion.div 
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full" 
              initial={{ left: "-100%", width: "50%" }}
              animate={{ left: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ position: "absolute" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400 rounded-lg flex items-center justify-center font-bold">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Environmental Insights</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
            Analyze the ecological footprints of your daily activities. Click or hover on objects in your Personal Biosphere to discover ways to restore equilibrium.
          </p>
        </div>
        {!hasRealData && (
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-semibold shadow-sm max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              Viewing simulation data.{" "}
              <Link href="/tracker" className="underline hover:text-amber-950 dark:hover:text-amber-100 font-bold transition-colors">
                Log real activities
              </Link>{" "}
              to unlock accurate footprints!
            </span>
          </div>
        )}
      </div>

      {/* Balanced Three-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Biosphere + Diagnosis + Gauge) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Dynamic Biosphere Section */}
          <div className={`bg-white dark:bg-slate-900/80 p-4 rounded-2xl border transition-all duration-500 ${
            isEmissionHigh 
              ? 'shadow-[0_0_30px_rgba(166,124,107,0.15)] border-amber-100/70 dark:border-amber-900/30' 
              : 'shadow-[0_0_30px_rgba(115,149,128,0.18)] border-emerald-100/80 dark:border-emerald-900/30'
          }`}>
            {/* Outer relative container: NO overflow-hidden, so tooltips can render outside */}
            <div className="relative h-[300px] md:h-[380px] w-full">
              
              {/* Background Canvas: MUST have rounded-xl and overflow-hidden to clip background colors & sun */}
              <div className={`absolute inset-0 rounded-xl overflow-hidden transition-all duration-1000 ${
                isEmissionHigh ? 'bg-gradient-to-b from-[#e3bf9a] to-[#eddccf]' : 'bg-gradient-to-b from-[#abd9ff] to-[#f0f8ff]'
              }`}>
                {/* SVG Sun from public folder */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-0">
                  <img
                    src={isEmissionHigh ? "/dry_sun.svg" : "/sun.svg"}
                    alt="Sun"
                    className="w-24 h-24 md:w-32 md:h-32 transition-transform duration-700 animate-[spin_180s_linear_infinite] select-none pointer-events-none"
                  />
                </div>

                {/* Ground Bar */}
                <div className={`absolute bottom-0 inset-x-0 h-10 transition-colors duration-1000 z-0 ${
                  isEmissionHigh ? 'bg-[#a67c6b]' : 'bg-[#739580]'
                }`} />
              </div>

              {/* Floating Hide Toggle button ("!") in the top-right corner of the canvas */}
              <button
                onClick={() => setIsBiosphereHidden(prev => !prev)}
                className={`absolute top-4 right-4 z-30 w-8 h-8 rounded-full border flex items-center justify-center font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-md ${
                  isBiosphereHidden
                    ? 'bg-slate-800 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-800 dark:border-slate-200'
                    : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-350 border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                }`}
                title={isBiosphereHidden ? "Show Biosphere Info" : "Hide Biosphere Info"}
              >
                !
              </button>

              {/* Status Glass Card Overlay - sits inside canvas bounds but absolutely positioned on top */}
              <AnimatePresence>
                {!isBiosphereHidden && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-6 left-0 right-0 mx-auto w-[90%] max-w-[280px] md:max-w-xs bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-3 md:p-4 border border-slate-200/50 dark:border-slate-800/50 z-20 shadow-lg transition-all"
                  >
                    <h2 className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                      <span>🌤️</span> Personal Biosphere
                    </h2>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {biosphereView === 'today'
                        ? (isEmissionHigh 
                            ? `Your carbon footprint logged today (${todayEmissions} kg) exceeds the 50.0 kg limit. The biosphere is arid.`
                            : `Your carbon footprint logged today (${todayEmissions} kg) is within the 50.0 kg limit. Thriving!`)
                        : (isEmissionHigh
                            ? `Your weekly daily average (${stats.dailyAvg} kg/day) exceeds the 40.0 kg limit. The biosphere is arid.`
                            : `Your weekly daily average (${stats.dailyAvg} kg/day) is within the 40.0 kg limit. Thriving!`)}
                    </p>
                    
                    {/* View Toggle Segmented Control */}
                    <div className="mt-2.5 flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg w-full border border-slate-200/20">
                      <button
                        onClick={() => setBiosphereView('today')}
                        className={`flex-1 text-center py-1 text-[9px] md:text-[10px] font-bold rounded-md transition-all ${
                          biosphereView === 'today'
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setBiosphereView('weekly')}
                        className={`flex-1 text-center py-1 text-[9px] md:text-[10px] font-bold rounded-md transition-all ${
                          biosphereView === 'weekly'
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350'
                        }`}
                      >
                        Weekly Avg
                      </button>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEmissionHigh
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-350'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                      }`}>
                        {isEmissionHigh ? "🍂 Arid" : "🌿 Thriving"}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-slate-650 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {biosphereView === 'today' ? `Today: ${todayEmissions} kg` : `Avg: ${stats.dailyAvg} kg/d`}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-100/30">
                        Dry Limit: {biosphereView === 'today' ? "50.0 kg" : "40.0 kg"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

                {/* Interactive Objects Overlay — each item pinned to ground top (bottom-10 = h-10 ground bar) */}
                <div className="absolute inset-x-0 bottom-0 top-0 z-10 pointer-events-none">

                  {/* Plant — left side */}
                  <div
                    className="absolute bottom-10 left-[12%] sm:left-[15%] md:left-[18%] w-24 md:w-28 flex flex-col items-center pointer-events-auto select-none"
                    onMouseEnter={() => setHoveredObject('plant')}
                    onMouseLeave={() => setHoveredObject(null)}
                  >
                    <AnimatePresence>
                      {(hoveredObject === 'plant') && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-2 left-0 translate-x-0 w-44 md:w-56 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 text-center text-[10px] md:text-xs text-slate-700 dark:text-slate-200"
                        >
                          <div className="font-extrabold mb-0.5 text-slate-800 dark:text-slate-100">
                            {AWARENESS_INFO.plant.title}
                          </div>
                          <div className="leading-normal">
                            {isEmissionHigh ? AWARENESS_INFO.plant.arid : AWARENESS_INFO.plant.thriving}
                          </div>
                          <div className="absolute bottom-[-6px] left-[30px] md:left-[50px] translate-x-0 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <img
                      src={isEmissionHigh ? "/dry_plant.svg" : "/plant.svg"}
                      alt="Plant"
                      className="w-full max-h-32 object-contain object-bottom cursor-pointer"
                    />
                  </div>

                  {/* Tree — center */}
                  <div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 md:w-36 flex flex-col items-center pointer-events-auto select-none"
                    onMouseEnter={() => setHoveredObject('tree')}
                    onMouseLeave={() => setHoveredObject(null)}
                  >
                    <AnimatePresence>
                      {(hoveredObject === 'tree') && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-2 left-0 right-0 mx-auto w-48 md:w-56 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 text-center text-[10px] md:text-xs text-slate-700 dark:text-slate-200"
                        >
                          <div className="font-extrabold mb-0.5 text-slate-800 dark:text-slate-100">
                            {AWARENESS_INFO.tree.title}
                          </div>
                          <div className="leading-normal">
                            {isEmissionHigh ? AWARENESS_INFO.tree.arid : AWARENESS_INFO.tree.thriving}
                          </div>
                          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <img
                      src={isEmissionHigh ? "/dry_tree.svg" : "/tree.svg"}
                      alt="Tree"
                      className="w-full max-h-44 object-contain object-bottom cursor-pointer"
                    />
                  </div>

                  {/* Flower — right side */}
                  <div
                    className="absolute bottom-10 right-[12%] sm:right-[15%] md:right-[18%] w-24 md:w-28 flex flex-col items-center pointer-events-auto select-none"
                    onMouseEnter={() => setHoveredObject('flower')}
                    onMouseLeave={() => setHoveredObject(null)}
                  >
                    <AnimatePresence>
                      {(hoveredObject === 'flower') && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-2 right-0 left-auto translate-x-0 w-44 md:w-56 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 text-center text-[10px] md:text-xs text-slate-700 dark:text-slate-200"
                        >
                          <div className="font-extrabold mb-0.5 text-slate-800 dark:text-slate-100">
                            {AWARENESS_INFO.flower.title}
                          </div>
                          <div className="leading-normal">
                            {isEmissionHigh ? AWARENESS_INFO.flower.arid : AWARENESS_INFO.flower.thriving}
                          </div>
                          <div className="absolute bottom-[-6px] right-[30px] md:right-[50px] left-auto translate-x-0 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <img
                      src={isEmissionHigh ? "/dry_flower.svg" : "/flower.svg"}
                      alt="Flower"
                      className="w-full max-h-32 object-contain object-bottom cursor-pointer"
                    />
                  </div>

                </div>
                
              </div>
          </div>


          {/* Impact Diagnosis Section */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-xs uppercase tracking-wider">Your Impact Diagnosis</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Card 1: Weekly Output */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-slate-50/35 dark:from-indigo-950/10 dark:to-slate-900/10 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/20 flex flex-col justify-between hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Weekly Output</span>
                  <div className="p-1.5 bg-indigo-100/40 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{stats.total}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">kg CO₂e</span>
                </div>
              </div>

              {/* Card 2: Daily Avg */}
              <div className="p-4 bg-gradient-to-br from-amber-50/50 to-slate-50/35 dark:from-amber-950/10 dark:to-slate-900/10 rounded-2xl border border-amber-100/60 dark:border-amber-900/20 flex flex-col justify-between hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-450 uppercase tracking-wider">Daily Avg</span>
                  <div className="p-1.5 bg-amber-100/40 dark:bg-amber-950/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{stats.dailyAvg}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">kg/day</span>
                </div>
              </div>

              {/* Card 3: Primary Source */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${categoryTheme.bg} ${categoryTheme.border} ${categoryTheme.hover}`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Primary Source</span>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-slate-600 dark:text-slate-300">
                    <categoryTheme.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${categoryTheme.badge}`}>
                    {stats.highestCat}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Recommendation based on Highest Category */}
            <div className={`p-5 rounded-2xl border flex gap-4 items-start transition-all duration-300 ${categoryTheme.bg} ${categoryTheme.border}`}>
              <div className={`p-2 rounded-full shrink-0 ${categoryTheme.badge}`}>
                <categoryTheme.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold mb-1.5 ${categoryTheme.text}`}>
                  {stats.highestCat === 'Transport' && 'Eco-Route Action Plan'}
                  {stats.highestCat === 'Food' && 'Sustainable Diet Action Plan'}
                  {stats.highestCat === 'Energy' && 'Smart Energy Action Plan'}
                  {stats.highestCat === 'General' && 'Welcome Action Plan'}
                </h3>
                <p className="text-xs leading-relaxed opacity-90 text-slate-700 dark:text-slate-300">
                  {stats.highestCat === 'Transport' && "Your transport actions represent a significant portion of your output. Swap 2 car journeys for cycling or transit this week to save an estimated 14.5 kg CO2e!"}
                  {stats.highestCat === 'Food' && "Food footprint stands high in your logs. Swapping one beef burger serving for vegetarian options cuts emissions by 75% for that meal. Try a 'Green Monday' recipe!"}
                  {stats.highestCat === 'Energy' && "Energy consumption is your largest log category. Ensure all power strips are turned off at night. Vampire load can quietly add 10% to your utility bill."}
                  {stats.highestCat === 'General' && "Start logging your daily commutes, dinners, and device usage on the Tracker page. Carbon Footprint Tracker will study your habits and compile customized reduction suggestions here!"}
                </p>
              </div>
            </div>
          </div>

          {/* Comparative Sustainability Gauge */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-indigo-500 animate-pulse" />
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">How do you stack up?</h2>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              To keep global warming under the critical 1.5°C threshold, the United Nations climate roadmap advises reducing personal emissions to a sustainable threshold of <strong>5.0 kg</strong> of CO2e per day. Let's see how your current stats compare:
            </p>

            <div className="space-y-6">
              {/* Target progress scale */}
              <div className="relative pt-2">
                <div className="flex mb-2 items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Sustainable Target (1.5°C)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">5.0 kg</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '36%' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.35)]" 
                  />
                </div>
              </div>

              <div className="relative pt-2">
                <div className="flex mb-2 items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Your Current Daily Avg</span>
                  <span className={stats.dailyAvg > 13.7 ? "text-rose-600 dark:text-rose-400 font-extrabold" : stats.dailyAvg > 5.0 ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-emerald-600 dark:text-emerald-400 font-extrabold"}>
                    {stats.dailyAvg} kg
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats.dailyAvg / 20) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                    className={`h-3 rounded-full shadow-sm ${
                      stats.dailyAvg > 13.7 
                        ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.35)]" 
                        : stats.dailyAvg > 5.0 
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.35)]" 
                          : "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                    }`}
                  />
                </div>
              </div>

              {/* Biosphere Dry Threshold Gauge */}
              <div className="relative pt-2">
                <div className="flex mb-2 items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Biosphere Dry Threshold ({biosphereView === 'today' ? "Today's Limit" : "Weekly Avg limit"})</span>
                  <span className="text-amber-600 dark:text-amber-455 font-extrabold">
                    {biosphereView === 'today' ? "50.0" : "40.0"} kg
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `100%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.35)]" 
                  />
                </div>
              </div>

              <div className="relative pt-2">
                <div className="flex mb-2 items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Global Average Daily Footprint</span>
                  <span>13.7 kg</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 h-3 rounded-full" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50/60 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl flex gap-3 items-start text-xs text-indigo-800 dark:text-indigo-300">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
              <span className="leading-relaxed">
                {stats.dailyAvg <= 5.0 && "Incredible! Your carbon footprint aligns with global climate targets. You are living sustainably!"}
                {stats.dailyAvg > 5.0 && stats.dailyAvg <= 13.7 && "Great start! You're beating the typical global average, but there's room to slide closer to the 5.0 kg sustainable target."}
                {stats.dailyAvg > 13.7 && "Your average emissions are above the global average. Pick 2 commitments from the cards below to immediately lower your impact!"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Column (Trivia, Commitments) */}
        <div className="space-y-6">
          
          {/* Trivia/Did you know Card */}
          <div className="relative bg-gradient-to-br from-emerald-600 to-teal-800 p-6 rounded-2xl shadow-lg border border-emerald-500/20 text-white flex flex-col justify-between h-fit min-h-[340px] overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Background design accents */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 border-b border-emerald-500/30 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-300" /> Did You Know?
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={prevTrivia} 
                    id="btn-prev-trivia"
                    className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all text-white border border-white/5 hover:border-white/10"
                    title="Previous Trivia"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={nextTrivia} 
                    id="btn-next-trivia"
                    className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all text-white border border-white/5 hover:border-white/10"
                    title="Next Trivia"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={triviaIndex}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="font-extrabold text-lg text-emerald-50 tracking-tight leading-snug">{TRIVIA[triviaIndex].title}</h3>
                  <p className="text-xs leading-relaxed text-emerald-100/90 font-medium">{TRIVIA[triviaIndex].fact}</p>
                  <div className="pt-4 border-t border-emerald-500/20">
                    <div className="text-3xl font-black text-white tracking-tight font-mono">{TRIVIA[triviaIndex].stat}</div>
                    <div className="text-[9px] uppercase font-bold text-emerald-200 tracking-widest mt-1">{TRIVIA[triviaIndex].statDesc}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="relative z-10 text-[9px] font-bold text-emerald-200/60 text-right pt-6 flex justify-between items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Slide {triviaIndex + 1} of {TRIVIA.length}</span>
            </div>
          </div>

          {/* Interactive Category Breakdowns and Commitments */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-5 text-xs uppercase tracking-wider">Eco Commitments & Awareness</h2>
            
            {/* Tabs switcher */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5 gap-1 overflow-x-auto pb-1">
              <button 
                onClick={() => setActiveTab('transport')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  activeTab === 'transport' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                <Car className="w-3.5 h-3.5" /> Commute
              </button>
              <button 
                onClick={() => setActiveTab('food')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  activeTab === 'food' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" /> Food
              </button>
              <button 
                onClick={() => setActiveTab('energy')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  activeTab === 'energy' 
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Energy
              </button>
            </div>

            {/* Tab contents */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className={`p-3.5 rounded-xl border text-xs ${activeTabTheme.bg} ${activeTabTheme.border}`}>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1.5">
                      <Info className="w-4 h-4 text-blue-500 shrink-0" />
                      {TAB_DATA[activeTab].infoTitle}
                    </span>
                    <p className="opacity-90 leading-relaxed text-slate-750 dark:text-slate-300">
                      {TAB_DATA[activeTab].infoText}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                        {activeTabTheme.label}
                      </h4>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${activeTabTheme.text} ${activeTabTheme.bg}`}>
                        {completedPledgesCount} of {TAB_DATA[activeTab].pledges.length} completed
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedPledgesCount / TAB_DATA[activeTab].pledges.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-1.5 rounded-full ${activeTabTheme.progress}`} 
                      />
                    </div>
                    
                    <div className="space-y-2 pt-1">
                      {TAB_DATA[activeTab].pledges.map(p => (
                        <label 
                          key={p.id} 
                          className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                            pledges[p.id] 
                              ? `${activeTabTheme.activeLabelBg} ${activeTabTheme.border}` 
                              : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            id={`pledge-${p.id}`}
                            checked={!!pledges[p.id]}
                            onChange={() => handlePledgeToggle(p.id)}
                            className={`rounded border-slate-300 dark:border-slate-700 focus:ring-offset-2 w-4 h-4 shrink-0 transition-all ${activeTabTheme.activeInput}`}
                          />
                          <span className={`text-xs select-none transition-all ${
                            pledges[p.id] 
                              ? 'text-slate-400 dark:text-slate-500 font-medium line-through opacity-80' 
                              : 'text-slate-700 dark:text-slate-300 font-medium'
                          }`}>
                            {p.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}


