"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, ArrowUpDown, Filter, AlertTriangle, Settings2, Lightbulb, Zap, Leaf, Droplet, X, ChevronLeft, ChevronRight, Trash2, Download, Share2 } from 'lucide-react';
import { useEco, LogEntry } from '@/components/eco-provider';
import { CustomSelect } from '@/components/custom-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { weeklyEmissions, categoryEmissions, logs, dailyLimit, setDailyLimit, deleteLog, deleteLogs } = useEco();

  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const hasRealData = logs.length > 0;

  const displayWeeklyEmissions = hasRealData ? weeklyEmissions : [
    { name: 'Mon', emissions: 12.5 },
    { name: 'Tue', emissions: 8.2 },
    { name: 'Wed', emissions: 15.0 },
    { name: 'Thu', emissions: 9.4 },
    { name: 'Fri', emissions: 11.1 },
    { name: 'Sat', emissions: 5.5 },
    { name: 'Sun', emissions: 7.2 },
  ];

  const [chartMode, setChartMode] = useState<'total' | 'weekly'>('total');

  const weeklyTrends = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Create buckets for 4 weeks ago, 3 weeks ago, 2 weeks ago, this week
    const weeks = [
      { name: 'Week 1', emissions: 0 },
      { name: 'Week 2', emissions: 0 },
      { name: 'Week 3', emissions: 0 },
      { name: 'Week 4', emissions: 0 },
    ];
    
    logs.forEach(log => {
      const logDate = new Date(log.date);
      const diffTime = today.getTime() - logDate.getTime();
      const diffDays = diffTime / msPerDay;
      
      if (diffDays >= 0 && diffDays < 28) {
        if (diffDays < 7) {
          weeks[3].emissions += log.emission;
        } else if (diffDays < 14) {
          weeks[2].emissions += log.emission;
        } else if (diffDays < 21) {
          weeks[1].emissions += log.emission;
        } else {
          weeks[0].emissions += log.emission;
        }
      }
    });

    return weeks.map(w => ({
      name: w.name,
      emissions: +(w.emissions / 7).toFixed(1) // Average daily emissions per week
    }));
  }, [logs]);

  const displayWeeklyTrends = hasRealData ? weeklyTrends.filter(e => e.emissions > 0).length > 0 ? weeklyTrends : [
    { name: 'Week 1', emissions: 0 },
    { name: 'Week 2', emissions: 0 },
    { name: 'Week 3', emissions: 0 },
    { name: 'Week 4', emissions: +(weeklyTrends[3].emissions).toFixed(1) },
  ] : [
    { name: 'Week 1', emissions: 8.5 },
    { name: 'Week 2', emissions: 9.1 },
    { name: 'Week 3', emissions: 7.8 },
    { name: 'Week 4', emissions: Math.round((45.4 / 7) * 10) / 10 },
  ];

  const chartData = chartMode === 'total' ? displayWeeklyEmissions : displayWeeklyTrends;

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const displayCategoryEmissions = useMemo(() => {
    if (!hasRealData && !selectedDay) return [
      { name: 'Transport', value: 45.2 },
      { name: 'Food', value: 24.8 },
      { name: 'Energy', value: 30.0 },
    ];
    if (!hasRealData && selectedDay) {
      // Deterministic fake data based on chosen day character
      const val = selectedDay.charCodeAt(0);
      return [
        { name: 'Transport', value: +(10 + (val % 5) * 5.2).toFixed(1) },
        { name: 'Food', value: +(15 + (val % 3) * 4.8).toFixed(1) },
        { name: 'Energy', value: +(20 + (val % 4) * 3.0).toFixed(1) },
      ];
    }
    
    // Compute exactly for selectedDay if active, otherwise overall categoryEmissions
    if (!selectedDay) return categoryEmissions;

    const catMap: Record<string, number> = {
      Transport: 0,
      Food: 0,
      Energy: 0,
    };
    logs.forEach(log => {
      const logDay = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (logDay === selectedDay) {
        let key = log.category;
        if (key === 'Transportation') key = 'Transport';
        if (catMap[key] !== undefined) {
          catMap[key] += log.emission;
        }
      }
    });

    const calculated = [
      { name: 'Transport', value: +(catMap['Transport'].toFixed(1)) },
      { name: 'Food', value: +(catMap['Food'].toFixed(1)) },
      { name: 'Energy', value: +(catMap['Energy'].toFixed(1)) },
    ].filter(c => c.value > 0);

    return calculated.length > 0 ? calculated : [{ name: 'No Data', value: 1 }];
  }, [hasRealData, categoryEmissions, logs, selectedDay]);

  const [sortColumn, setSortColumn] = useState<keyof LogEntry>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');
  const [showSettings, setShowSettings] = useState(false);
  const [tempLimit, setTempLimit] = useState(dailyLimit.toString());

  useEffect(() => {
    setTempLimit(dailyLimit.toString());
  }, [dailyLimit]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDirectionRef = useRef<'right' | 'left'>('right');

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
    
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  useEffect(() => {
    handleScroll();
  }, []);

  useEffect(() => {
    if (isDragging || isHovered) return;
    
    const intervalId = setInterval(() => {
      // Don't auto-slide if on large screen (xl breakpoint is 1280px)
      if (window.innerWidth >= 1280) return;

      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement;
        const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 250; // default 250 if not found, 16 is gap
        
        if (scrollDirectionRef.current === 'right') {
          // If we've reached the end, switch to left mode
          if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 50) {
            scrollDirectionRef.current = 'left';
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        } else {
          // If we've reached the beginning, switch to right mode
          if (scrollLeft <= 50) {
            scrollDirectionRef.current = 'right';
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          }
        }
      }
    }, 4000); // 4 seconds interval

    return () => clearInterval(intervalId);
  }, [isDragging, isHovered]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll faster
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  const handleSaveLimit = () => {
    const limit = parseFloat(tempLimit);
    if (!isNaN(limit) && limit > 0) {
      setDailyLimit(limit);
      setShowSettings(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayEmissions = weeklyEmissions.find(e => e.name === today)?.emissions || 0;
  const isOverLimit = todayEmissions >= dailyLimit;
  const isNearLimit = !isOverLimit && todayEmissions >= dailyLimit * 0.8;

  const highestCategory = useMemo(() => {
    if (!displayCategoryEmissions || displayCategoryEmissions.length === 0) return 'General';
    const sorted = [...displayCategoryEmissions].sort((a, b) => b.value - a.value);
    if (sorted[0].value === 0) return 'General';
    return sorted[0].name;
  }, [displayCategoryEmissions]);

  const ECO_TIPS = [
    "“The Earth is what we all have in common.” – Wendell Berry. Start your day by unplugging devices not in use.",
    "Consider carpooling, biking, or taking public transit today to cut down on transportation emissions.",
    "Try having a plant-based meal today. Reducing meat consumption significantly lowers your carbon footprint.",
    "“We do not inherit the earth from our ancestors, we borrow it from our children.” Make sustainable choices today.",
    "Turn off the tap while brushing your teeth. Every drop counts!",
    "Switch to reusable bags. Small actions create big impacts over time.",
    "Use a refillable water bottle instead of buying single-use plastic cups and bottles.",
    "“The greatest threat to our planet is the belief that someone else will save it.” – Robert Swan.",
    "Take a shorter shower today to conserve water and water-heating energy.",
    "Air dry your clothes instead of using a dryer. It saves energy and helps your clothes last longer.",
    "“Environment is no one's property to destroy; it's everyone's responsibility to protect.” – Mohith Agadi.",
    "Avoid single-use plastics when picking up lunch today. Bring your own container or utensils.",
    "Unplug your phone charger when your phone is at 100%. Phantom power drain is real!",
    "“There is no such thing as 'away'. When we throw anything away it must go somewhere.” – Annie Leonard.",
    "Try the 'one in, one out' rule for clothing to reduce textile waste.",
  ];

  const ecoTip = useMemo(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return ECO_TIPS[dayOfYear % ECO_TIPS.length];
  }, []);

  const handleSort = (column: keyof LogEntry) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const mockLogsList: LogEntry[] = useMemo(() => {
    if (hasRealData) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fake: LogEntry[] = [];
    
    // Pick a known Sunday: Jan 1, 2023 was a Sunday.
    // So Jan 1 = Sun, Jan 2 = Mon, ... Jan 7 = Sat.
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    dayLabels.forEach((dayLabel, idx) => {
      const dayOffset = dayLabel === 'Sun' ? 1 : idx + 2; // Jan 1 is Sun, Jan 2 is Mon...
      
      const val = dayLabel.charCodeAt(0);
      fake.push({
        id: `mock-${idx}-1`,
        date: new Date(2023, 0, dayOffset, 10, 0, 0).toISOString(),
        category: 'Transport',
        emission: +(10 + (val % 5) * 5.2).toFixed(1),
        message: 'Sample Transport activity',
      });
      fake.push({
        id: `mock-${idx}-2`,
        date: new Date(2023, 0, dayOffset, 14, 0, 0).toISOString(),
        category: 'Food',
        emission: +(15 + (val % 3) * 4.8).toFixed(1),
        message: 'Sample Food activity',
      });
    });
    return fake;
  }, [hasRealData]);

  const filteredAndSortedLogs = useMemo(() => {
    let result = hasRealData ? [...logs] : [...mockLogsList];
    
    if (selectedDay) {
      result = result.filter(log => new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }) === selectedDay);
    }

    if (filterCategory !== 'All Categories') {
      result = result.filter(log => {
        if (filterCategory === 'Transport' && log.category.startsWith('Transport')) return true;
        return log.category === filterCategory;
      });
    }

    if (sortColumn) {
      result.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
           return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
           return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [logs, sortColumn, sortDirection, filterCategory, selectedDay]);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLogs(filteredAndSortedLogs.map(log => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const toggleSelectLog = (id: string) => {
    setSelectedLogs(prev => 
      prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
    );
  };

  const handleDownloadJSON = () => {
    const dataToDownload = hasRealData ? logs : mockLogsList;
    if (dataToDownload.length === 0) return;
    
    const exportData = selectedLogs.length > 0 
      ? dataToDownload.filter(log => selectedLogs.includes(log.id))
      : dataToDownload;

    const exportDataWithoutId = exportData.map(({ id, ...rest }) => rest);
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportDataWithoutId, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "emissions_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleShareDashboard = async () => {
    const node = dashboardRef.current;
    if (!node) return;

    try {
      setIsSharing(true);

      // Apply the capture class to trigger CSS overrides
      node.classList.add('is-capturing');

      // Wait for React to apply classes and layout to settle
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: '#f8fafc',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: node.offsetWidth + 'px',
          height: node.offsetHeight + 'px',
        },
      });

      // Remove the capture class immediately
      node.classList.remove('is-capturing');

      // Trigger the file download
      const link = document.createElement('a');
      link.download = `carbon_footprint_tracker_dashboard_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Trigger standard confetti explosion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
      });

    } catch (error) {
      console.error('Failed to generate dashboard image:', error);
      alert('Failed to generate dashboard image. Please try again.');
      node.classList.remove('is-capturing');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLogs.length > 0) {
      deleteLogs(selectedLogs);
      setSelectedLogs([]);
    }
  };

  const logsTodayCount = logs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).length;
  const totalLogsCount = logs.length;
  const totalWeekly = displayWeeklyEmissions.reduce((acc, curr) => acc + curr.emissions, 0);
  
  // Calculate average only over elapsed days
  const todayIndex = displayWeeklyEmissions.findIndex(e => e.name === today) + 1 || 1;
  const elapsedEmissions = displayWeeklyEmissions.slice(0, todayIndex).reduce((sum, e) => sum + e.emissions, 0);
  const currentDailyAvg = elapsedEmissions / todayIndex;
  
  const weeklyAvg = (totalWeekly / 7).toFixed(1);
  const projectedEndOfWeek = (currentDailyAvg * 7).toFixed(1);

  const [closedTips, setClosedTips] = useState({ ecoTip: false, highEmission: false, limitAlert: false });

  return (
    <div ref={dashboardRef} className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col tablet:flex-row md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-400 transition-colors duration-500">Your Impact Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 transition-colors duration-500 mb-0 md:mb-3">Here's how your carbon footprint looks today.</p>
        </div>
        <div className="flex items-center justify-between gap-4 w-full md:w-auto">
          <div className="flex flex-col items-start md:items-end flex-grow md:flex-grow-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors duration-500">Today's Goal</span>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="w-full md:w-32 h-1.5 bg-slate-200 dark:bg-slate-800/50 rounded-full overflow-hidden flex-grow shrink transition-colors duration-500">
                <div 
                  className={`h-full transition-all duration-500 ${isOverLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min((todayEmissions / dailyLimit) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400 whitespace-nowrap shrink-0 transition-colors duration-500">{todayEmissions.toFixed(1)} / {dailyLimit} kg</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center gap-2 p-2 md:px-3 md:py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors shrink-0 no-capture"
              title="Limit Settings"
            >
              <Settings2 className="w-4 h-4" /> <span className="hidden md:inline">Limit Settings</span>
            </button>
            <button 
              onClick={handleShareDashboard}
              disabled={isSharing}
              className="flex items-center justify-center gap-2 p-2 md:px-3 md:py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 active:scale-95 transition-all shrink-0 disabled:opacity-50 no-capture"
              title="Share Dashboard"
            >
              {isSharing ? (
                <>
                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> <span className="hidden md:inline">Share Dashboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {!closedTips.ecoTip && (
        <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100 flex gap-4 items-start shadow-sm relative">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="pr-6">
            <h3 className="text-sm font-bold text-emerald-800 mb-1">Daily Eco-Tip</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">{ecoTip}</p>
          </div>
          <button 
            onClick={() => setClosedTips(prev => ({ ...prev, ecoTip: true }))}
            className="absolute top-4 right-4 text-emerald-600/50 hover:text-emerald-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {todayEmissions > 50 && !closedTips.highEmission && (
        <div className="bg-rose-50 p-5 rounded-lg border border-rose-100 flex gap-4 items-start shadow-sm mt-4 relative">
          <div className="p-2 bg-rose-100 rounded-full text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="pr-6">
            <h3 className="text-sm font-bold text-rose-800 mb-1">High Emissions Alert</h3>
            <p className="text-sm text-rose-700 leading-relaxed">Your daily emissions have exceeded 50kg. Consider significant offset actions to maintain your carbon neutrality goals.</p>
          </div>
          <button 
            onClick={() => setClosedTips(prev => ({ ...prev, highEmission: true }))}
            className="absolute top-4 right-4 text-rose-600/50 hover:text-rose-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {(isOverLimit || isNearLimit) && !closedTips.limitAlert && (
        <div className={`p-4 rounded-lg flex items-start gap-3 border shadow-sm mt-4 relative ${
          isOverLimit ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 ${isOverLimit ? 'text-rose-500' : 'text-amber-500'}`} />
          <div className="pr-6">
            <h3 className="text-sm font-bold">
              {isOverLimit ? 'Daily Limit Reached' : 'Approaching Daily Limit'}
            </h3>
            <p className="text-xs mt-1" style={{ opacity: 0.9 }}>
              You've recorded {todayEmissions.toFixed(1)} kg CO2e today, which is {isOverLimit ? 'at or beyond' : 'nearing'} your daily limit of {dailyLimit} kg CO2e.
            </p>
          </div>
          <button 
            onClick={() => setClosedTips(prev => ({ ...prev, limitAlert: true }))}
            className={`absolute top-4 right-4 transition-colors ${
              isOverLimit ? 'text-rose-600/50 hover:text-rose-700' : 'text-amber-600/50 hover:text-amber-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative group">
        {canScrollLeft && !isDragging && !isScrolling && (
          <button 
            onClick={scrollLeft}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-700 hover:text-emerald-600 hover:scale-110 active:scale-95 focus:outline-none transition-all hidden sm:flex xl:hidden no-capture"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && !isDragging && !isScrolling && (
          <button 
            onClick={scrollRight}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-700 hover:text-emerald-600 hover:scale-110 active:scale-95 focus:outline-none transition-all hidden sm:flex xl:hidden no-capture"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div 
          ref={scrollContainerRef}
          className={`flex overflow-x-auto xl:grid xl:grid-cols-5 xl:overflow-visible gap-4 pb-4 px-1 sm:px-1 xl:px-0 hide-scroll-bar select-none xl:select-auto ${isDragging ? 'snap-none cursor-grabbing xl:cursor-auto' : 'snap-x snap-mandatory cursor-grab xl:cursor-auto'} xl:snap-none`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onScroll={handleScroll}
        >
          {/* Today's Emissions Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between w-[80vw] max-w-[280px] xl:w-full xl:max-w-none shrink-0 snap-start xl:snap-align-none transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Emissions</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-800">{todayEmissions.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-md shrink-0">
                <Zap className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded text-emerald-600 bg-emerald-50 border border-emerald-100">
                — On Track
              </span>
            </div>
          </div>

          {/* Logs Today Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between w-[80vw] max-w-[280px] xl:w-full xl:max-w-none shrink-0 snap-start xl:snap-align-none transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Footprints Today</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-800">{logsTodayCount}</span>
                  <span className="text-xs font-bold text-slate-500">actions</span>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-md shrink-0">
                <Leaf className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded text-emerald-600 bg-emerald-50 border border-emerald-100">
                ↗ Active
              </span>
            </div>
          </div>

          {/* Total Logs Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between w-[80vw] max-w-[280px] xl:w-full xl:max-w-none shrink-0 snap-start xl:snap-align-none transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Footprints</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-800">{totalLogsCount}</span>
                  <span className="text-xs font-bold text-slate-500">actions</span>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-md shrink-0">
                <Droplet className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded text-slate-500 bg-slate-50 border border-slate-200">
                — Historical
              </span>
            </div>
          </div>

          {/* Weekly Avg Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between w-[80vw] max-w-[280px] xl:w-full xl:max-w-none shrink-0 snap-start xl:snap-align-none transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Weekly Avg</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-800">{weeklyAvg}</span>
                  <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-md shrink-0">
                <span className="text-slate-500 font-bold text-lg">↓</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded text-emerald-600 bg-emerald-50 border border-emerald-100">
                ↘ 5% vs last week
              </span>
            </div>
          </div>

          {/* Emission Forecast Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between w-[80vw] max-w-[280px] xl:w-full xl:max-w-none shrink-0 snap-start xl:snap-align-none transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Emission Forecast</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-800">{projectedEndOfWeek}</span>
                  <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-md shrink-0">
                <span className="text-slate-500 font-bold text-lg">↑</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded text-amber-600 bg-amber-50 border border-amber-100">
                Est. weekly total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Removed the limit section from here */}

      {/* Limit Settings Pop-up */}
      {mounted && showSettings && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSettings(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <label className="text-[14px] font-bold text-slate-800 tracking-tight">Set Daily Goal</label>
              <button onClick={() => setShowSettings(false)} className="p-2 -mr-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-sm text-slate-500 mb-5">Set your target daily carbon footprint limit in kg CO2e.</div>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  step="0.1"
                  value={tempLimit} 
                  onChange={e => setTempLimit(e.target.value)}
                  className="text-3xl py-4 pl-4 pr-12 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 w-full font-bold text-slate-800 placeholder-slate-300 transition-colors shadow-inner bg-slate-50"
                />
                <span className="absolute right-5 text-sm font-bold text-slate-400">kg</span>
              </div>
              <button 
                onClick={handleSaveLimit}
                className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all text-sm shadow-sm shadow-emerald-500/20"
              >
                Save Limit
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {chartMode === 'total' ? 'Weekly Emissions' : 'Weekly Trends'} <span className="hidden sm:inline">(kg CO2e)</span>
              </h2>
              {chartMode === 'total' && selectedDay && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 cursor-pointer hover:bg-emerald-100" onClick={() => setSelectedDay(null)}>
                  {selectedDay} &times;
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!hasRealData && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded hidden sm:inline-block">Sample</span>}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => setChartMode('total')}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${chartMode === 'total' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Total
                </button>
                <button 
                  onClick={() => {
                    setChartMode('weekly');
                    setSelectedDay(null);
                  }}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${chartMode === 'weekly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                className={chartMode === 'total' ? 'cursor-pointer' : ''}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="emissions" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40}
                  onClick={(data, index) => {
                    if (chartMode === 'weekly') return;
                    const label = data?.name || data?.payload?.name;
                    if (label) {
                      setSelectedDay(prev => prev === label ? null : label);
                    }
                  }}
                >
                  {chartData.map((entry, index) => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                    const isSelected = selectedDay === entry.name;
                    const isToday = chartMode === 'total' && entry.name === today;
                    const opacity = chartMode === 'total' && selectedDay && !isSelected ? 0.4 : 1;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isToday ? '#047857' : (chartMode === 'weekly' ? COLORS[index % COLORS.length] : '#10b981')} 
                        fillOpacity={opacity} 
                        className="transition-opacity duration-300 cursor-pointer" 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              {selectedDay ? `${selectedDay}'s Emissions` : 'Emissions by Category'}
            </h2>
            {!hasRealData && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Sample Data</span>}
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayCategoryEmissions}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayCategoryEmissions.map((entry, index) => {
                    const isSelected = filterCategory === entry.name;
                    const opacity = filterCategory !== 'All Categories' && !isSelected && entry.name !== 'No Data' ? 0.4 : 1;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'No Data' ? '#cbd5e1' : COLORS[index % COLORS.length]} 
                        fillOpacity={opacity}
                        className={entry.name !== 'No Data' ? 'cursor-pointer hover:opacity-80 transition-opacity outline-none' : 'outline-none'}
                        onClick={() => {
                          if (entry.name !== 'No Data') {
                            setFilterCategory(prev => prev === entry.name ? 'All Categories' : entry.name);
                          }
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} kg CO2e`, 'Emissions']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {selectedDay ? `${selectedDay}'s Footprints` : 'Footprint Log'}
          </h2>
          {(hasRealData ? logs.length > 0 : mockLogsList.length > 0) && (
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 no-capture">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded hover:bg-emerald-100 transition-colors mr-2"
                title="Download JSON"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>
              {selectedLogs.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-100 transition-colors mr-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected ({selectedLogs.length})
                </button>
              )}
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="w-40 sm:w-48 shrink-0">
                <CustomSelect 
                  value={filterCategory} 
                  onChange={setFilterCategory}
                  options={['All Categories', 'Transport', 'Food', 'Energy']}
                  size="small"
                />
              </div>
            </div>
          )}
        </div>
        
        {(!hasRealData ? mockLogsList.length === 0 : logs.length === 0) ? (
          <p className="text-sm text-slate-500 text-center py-8">No carbon footprints recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Mobile / Narrow View (Card Layout) */}
            <div className={`md:hidden flex flex-col gap-3 ${filteredAndSortedLogs.length > 5 ? "max-h-[400px] overflow-y-auto pr-1" : ""}`}>
              {filteredAndSortedLogs.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg shadow-sm no-capture">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="mobile-select-all"
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={filteredAndSortedLogs.length > 0 && selectedLogs.length === filteredAndSortedLogs.length}
                      onChange={toggleSelectAll}
                    />
                    <label htmlFor="mobile-select-all" className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer">
                      Select All
                    </label>
                  </div>
                  <button 
                    onClick={() => handleSort('date')} 
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider"
                  >
                    Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {filteredAndSortedLogs.map((log) => (
                  <motion.div 
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.2 }}
                    className="flex relative items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors"
                  >
                    <div className="mt-1 flex-shrink-0 no-capture">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => toggleSelectLog(log.id)}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 w-fit uppercase tracking-wider">
                            {log.category.replace('Transportation', 'Transport')}
                          </span>
                          <div className="text-sm font-bold text-slate-700">
                            {mounted ? new Date(log.date).toLocaleDateString() : ""}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400">
                            {mounted ? new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </div>
                        </div>
                        <div className="text-right flex flex-col gap-1 items-end mt-1">
                          <span className="font-mono text-sm font-bold text-rose-600">
                            +{log.emission} <span className="text-[10px] text-rose-400">kg</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="absolute bottom-2 right-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors no-capture"
                      title="Delete footprint record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredAndSortedLogs.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">No matching activities found.</p>
              )}
            </div>

            {/* Desktop View (Table Layout) */}
            <div className={`hidden md:block overflow-x-auto ${filteredAndSortedLogs.length > 5 ? "max-h-[300px] overflow-y-auto" : ""}`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg w-10 no-capture">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        checked={filteredAndSortedLogs.length > 0 && selectedLogs.length === filteredAndSortedLogs.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1">Category <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('emission')}>
                      <div className="flex items-center gap-1">Emissions (kg CO2e) <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-4 py-3 rounded-r-lg no-capture">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <AnimatePresence>
                    {filteredAndSortedLogs.map((log) => (
                      <motion.tr 
                        key={log.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 no-capture">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            checked={selectedLogs.includes(log.id)}
                            onChange={() => toggleSelectLog(log.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {mounted ? new Date(log.date).toLocaleDateString() : ""} <span className="text-slate-400 ml-1">{mounted ? new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            {log.category.replace('Transportation', 'Transport')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-rose-600">
                          +{log.emission}
                        </td>
                        <td className="px-4 py-3 text-right no-capture">
                          <button
                            onClick={() => deleteLog(log.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete footprint record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredAndSortedLogs.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">No matching activities found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
