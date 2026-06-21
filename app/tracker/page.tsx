"use client";

import { useState } from 'react';
import { Activity, Car, Utensils, Zap, Plus, Lightbulb, Trash2, X, Leaf, TrendingDown, Droplets, TreePine, Recycle, ChevronRight, Sparkles, Target, Heart, Wind, Sun, Bike, TrainFront, Flame } from 'lucide-react';
import { useEco } from '@/components/eco-provider';
import { CustomSelect } from '@/components/custom-select';
import { ActivityInputSchema } from '@/lib/validation';

interface Tip {
  icon: 'leaf' | 'trending' | 'droplets' | 'tree' | 'recycle' | 'sparkles' | 'target' | 'heart' | 'wind' | 'sun' | 'bike' | 'train' | 'flame';
  title: string;
  text: string;
  type: 'positive' | 'suggestion' | 'impact' | 'warning';
}

const tipIconMap: Record<Tip['icon'], React.ElementType> = {
  leaf: Leaf,
  trending: TrendingDown,
  droplets: Droplets,
  tree: TreePine,
  recycle: Recycle,
  sparkles: Sparkles,
  target: Target,
  heart: Heart,
  wind: Wind,
  sun: Sun,
  bike: Bike,
  train: TrainFront,
  flame: Flame,
};

const tipTypeStyles: Record<Tip['type'], { bg: string; border: string; iconBg: string; iconColor: string; titleColor: string; textColor: string }> = {
  positive: { 
    bg: 'bg-gradient-to-br from-emerald-50/90 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10', 
    border: 'border-emerald-200/60 dark:border-emerald-900/30', 
    iconBg: 'bg-emerald-100/70 dark:bg-emerald-900/40', 
    iconColor: 'text-emerald-600 dark:text-emerald-400', 
    titleColor: 'text-emerald-800 dark:text-emerald-300', 
    textColor: 'text-emerald-700 dark:text-slate-300' 
  },
  suggestion: { 
    bg: 'bg-gradient-to-br from-sky-50/90 to-blue-50/40 dark:from-sky-950/20 dark:to-blue-950/10', 
    border: 'border-sky-200/60 dark:border-sky-900/30', 
    iconBg: 'bg-sky-100/70 dark:bg-sky-900/40', 
    iconColor: 'text-sky-600 dark:text-sky-400', 
    titleColor: 'text-sky-800 dark:text-sky-300', 
    textColor: 'text-sky-700 dark:text-slate-300' 
  },
  impact: { 
    bg: 'bg-gradient-to-br from-amber-50/90 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10', 
    border: 'border-amber-200/60 dark:border-amber-900/30', 
    iconBg: 'bg-amber-100/70 dark:bg-amber-900/40', 
    iconColor: 'text-amber-600 dark:text-amber-400', 
    titleColor: 'text-amber-800 dark:text-amber-300', 
    textColor: 'text-amber-700 dark:text-slate-300' 
  },
  warning: { 
    bg: 'bg-gradient-to-br from-rose-50/90 to-red-50/40 dark:from-rose-950/20 dark:to-red-950/10', 
    border: 'border-rose-200/60 dark:border-rose-900/30', 
    iconBg: 'bg-rose-100/70 dark:bg-rose-900/40', 
    iconColor: 'text-rose-600 dark:text-rose-400', 
    titleColor: 'text-rose-800 dark:text-rose-300', 
    textColor: 'text-rose-700 dark:text-slate-300' 
  },
};

export default function Tracker() {
  const { addEmission, logs, addLog, deleteLog, deleteLogs } = useEco();

  const [transportMode, setTransportMode] = useState('Public Transit (Bus/Train)');
  const [transportDistance, setTransportDistance] = useState('');

  const [foodType, setFoodType] = useState('Vegan Meal');
  const [foodServings, setFoodServings] = useState('');

  const [energyAction, setEnergyAction] = useState('Renewable Source (Solar/Wind)');
  const [energyDuration, setEnergyDuration] = useState('');

  const [recentTips, setRecentTips] = useState<Tip[]>([]);
  const [hiddenLogIds, setHiddenLogIds] = useState<string[]>([]);

  const handleTransportLog = (macroMode?: string, macroDist?: string) => {
    const rawVal = parseFloat(macroDist ?? transportDistance) || 0;
    const mode = macroMode ?? transportMode;
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: rawVal, label: mode });
    if (!result.success) {
      console.error(result.error.issues[0].message);
      return;
    }
    const dist = result.data.value;
    const safeMode = result.data.label;
    let emission = 0;
    const tips: Tip[] = [];

    if (transportMode.includes('Bicycle')) {
      emission = 0;
      tips.push({ icon: 'bike', title: 'Zero Emissions!', text: `Biking ${dist}km produces absolutely zero carbon emissions. You're a champion!`, type: 'positive' });
      const savedKg = +(dist * 0.2).toFixed(1);
      tips.push({ icon: 'tree', title: 'Carbon Saved', text: `You saved ~${savedKg}kg CO₂ compared to driving a car — equivalent to ${Math.ceil(savedKg / 0.02)} smartphone charges!`, type: 'impact' });
      if (dist >= 10) {
        tips.push({ icon: 'heart', title: 'Health Boost', text: `Cycling ${dist}km burns roughly ${Math.round(dist * 30)} calories. Your body and the planet both thank you!`, type: 'positive' });
      }
      if (dist >= 20) {
        tips.push({ icon: 'sparkles', title: 'Long-Distance Hero', text: `${dist}km by bike is impressive! If everyone cycled this distance once a week, urban emissions would drop by ~10%.`, type: 'impact' });
      }
    } else if (transportMode.includes('Public')) {
      emission = +(dist * 0.05).toFixed(1);
      tips.push({ icon: 'train', title: 'Smart Commute', text: `Public transit for ${dist}km emitted only ${emission}kg CO₂ — 75% less than driving alone.`, type: 'positive' });
      if (dist <= 5) {
        tips.push({ icon: 'bike', title: 'Even Greener Option', text: `For short trips under 5km, consider walking or biking to cut emissions to absolute zero!`, type: 'suggestion' });
      }
      if (dist >= 15) {
        tips.push({ icon: 'leaf', title: 'Major Impact', text: `By choosing transit over a car for ${dist}km, you avoided ~${+(dist * 0.15).toFixed(1)}kg CO₂. That's like saving ${Math.ceil(dist * 0.15 / 0.02)} phone charges of energy!`, type: 'impact' });
      }
      tips.push({ icon: 'target', title: 'Did You Know?', text: `If 30% of car commuters switched to transit, city-level transport emissions would drop by up to 20%.`, type: 'suggestion' });
    } else if (transportMode.includes('Electric')) {
      emission = +(dist * 0.08).toFixed(1);
      tips.push({ icon: 'sparkles', title: 'EV Advantage', text: `Your EV trip of ${dist}km produced ${emission}kg CO₂ — 60% less than a gasoline car.`, type: 'positive' });
      if (dist >= 30) {
        tips.push({ icon: 'sun', title: 'Charge Green', text: `For long trips like ${dist}km, charging your EV with solar or wind energy can make it nearly carbon-neutral!`, type: 'suggestion' });
      }
      if (dist <= 10) {
        tips.push({ icon: 'bike', title: 'Consider Alternatives', text: `For short trips under 10km, biking or walking eliminates even the indirect EV emissions entirely.`, type: 'suggestion' });
      }
      tips.push({ icon: 'wind', title: 'Grid Impact', text: `As renewable energy grows on the grid, your EV's footprint shrinks automatically. EVs get greener over time!`, type: 'impact' });
    } else {
      emission = +(dist * 0.2).toFixed(1);
      tips.push({ icon: 'flame', title: 'High Emission Alert', text: `Driving ${dist}km in a gasoline car produced ${emission}kg CO₂. That's the equivalent of charging a phone ${Math.ceil(emission / 0.02)} times.`, type: 'warning' });
      if (dist <= 5) {
        tips.push({ icon: 'bike', title: 'Walk or Bike Instead', text: `For trips under 5km, walking or cycling takes roughly the same time in urban traffic and produces zero emissions!`, type: 'suggestion' });
      } else if (dist <= 15) {
        tips.push({ icon: 'train', title: 'Try Public Transit', text: `For a ${dist}km trip, public transit would have emitted only ${+(dist * 0.05).toFixed(1)}kg CO₂ — that's ${Math.round((1 - 0.05/0.2) * 100)}% less!`, type: 'suggestion' });
      } else {
        tips.push({ icon: 'recycle', title: 'Carpool to Cut Half', text: `For long trips like ${dist}km, carpooling with just one other person halves per-person emissions to ${+(emission / 2).toFixed(1)}kg.`, type: 'suggestion' });
      }
      tips.push({ icon: 'trending', title: 'Reduction Goal', text: `Replacing just 2 car trips per week with transit or biking can save over 500kg CO₂ per year.`, type: 'impact' });
      if (emission >= 5) {
        tips.push({ icon: 'tree', title: 'Offset Equivalent', text: `To offset ${emission}kg CO₂, you'd need a tree to grow for about ${Math.ceil(emission / 22 * 365)} days. Consider reducing future trips!`, type: 'warning' });
      }
    }

    addEmission(emission, 'Transport');
    addLog({ category: 'Transport', emission, message: `Logged Transport: ${safeMode} (${dist}km)` });
    setRecentTips(tips);
    if (!macroDist) setTransportDistance('');
  };

  const handleFoodLog = (macroType?: string, macroSrv?: string) => {
    const rawVal = parseFloat(macroSrv ?? foodServings) || 0;
    const type = macroType ?? foodType;
    const result = ActivityInputSchema.safeParse({ category: 'Food', value: rawVal, label: type });
    if (!result.success) {
      console.error(result.error.issues[0].message);
      return;
    }
    const servings = result.data.value;
    const safeType = result.data.label;
    let emission = 0;
    const tips: Tip[] = [];

    if (foodType.includes('Vegan')) {
      emission = +(servings * 0.5).toFixed(1);
      tips.push({ icon: 'leaf', title: 'Planet-Friendly Choice!', text: `Your ${servings} vegan serving(s) produced only ${emission}kg CO₂ — the lowest footprint of any meal type.`, type: 'positive' });
      tips.push({ icon: 'droplets', title: 'Water Saved', text: `Vegan meals use ~${Math.round(servings * 200)}L less water per serving compared to beef. That's ${Math.round(servings * 200 / 150)} showers saved!`, type: 'impact' });
      if (servings >= 3) {
        tips.push({ icon: 'sparkles', title: 'All-Day Vegan', text: `${servings} vegan servings in a day! If everyone did this once a week, we'd save 6 billion kg of CO₂ annually.`, type: 'positive' });
      }
      tips.push({ icon: 'heart', title: 'Nutrition Tip', text: `Pair legumes with whole grains for complete proteins. Lentils, chickpeas, and quinoa are excellent choices!`, type: 'suggestion' });
    } else if (foodType.includes('Vegetarian')) {
      emission = +(servings * 0.8).toFixed(1);
      tips.push({ icon: 'leaf', title: 'Great Choice!', text: `${servings} vegetarian serving(s) emitted ${emission}kg CO₂ — 77% less than an equivalent beef meal.`, type: 'positive' });
      tips.push({ icon: 'droplets', title: 'Resource Savings', text: `Vegetarian meals use ~${Math.round(servings * 150)}L less water than beef alternatives per serving.`, type: 'impact' });
      if (servings >= 2) {
        tips.push({ icon: 'target', title: 'Go Fully Plant-Based', text: `Try swapping dairy cheese for nutritional yeast or cashew-based alternatives to cut the footprint by another 40%!`, type: 'suggestion' });
      }
      tips.push({ icon: 'trending', title: 'Weekly Impact', text: `Making ${servings} serving(s) vegetarian daily for a week saves ~${+(servings * 0.7 * 7).toFixed(1)}kg CO₂ vs choosing beef.`, type: 'impact' });
    } else if (foodType.includes('Chicken')) {
      emission = +(servings * 1.5).toFixed(1);
      tips.push({ icon: 'flame', title: 'Moderate Footprint', text: `${servings} chicken/fish serving(s) produced ${emission}kg CO₂ — less than beef but higher than plant-based options.`, type: 'impact' });
      tips.push({ icon: 'leaf', title: 'Swap Suggestion', text: `Replacing just one chicken serving with a vegan option saves ${+(1.5 - 0.5).toFixed(1)}kg CO₂ per meal.`, type: 'suggestion' });
      if (servings >= 3) {
        tips.push({ icon: 'target', title: 'Meatless Monday', text: `With ${servings} servings today, consider making tomorrow a fully plant-based day to balance your weekly footprint.`, type: 'suggestion' });
      }
      tips.push({ icon: 'recycle', title: 'Sourcing Matters', text: `Choose locally sourced, free-range chicken when possible — it reduces transportation emissions and supports ethical farming.`, type: 'suggestion' });
    } else {
      emission = +(servings * 3.5).toFixed(1);
      tips.push({ icon: 'flame', title: 'High-Impact Meal', text: `${servings} beef/lamb serving(s) produced ${emission}kg CO₂ — that's equivalent to driving ${Math.round(emission / 0.2)}km in a car!`, type: 'warning' });
      tips.push({ icon: 'droplets', title: 'Water Footprint', text: `Beef requires ~${Math.round(servings * 2500)}L of water per serving. That's ${Math.round(servings * 2500 / 150)} showers worth of water!`, type: 'warning' });
      if (servings >= 2) {
        tips.push({ icon: 'leaf', title: 'Flexitarian Challenge', text: `Try the "50% swap" — replace half your beef servings with mushrooms or lentils. You'll barely taste the difference but save ${+(servings * 1.5).toFixed(1)}kg CO₂!`, type: 'suggestion' });
      }
      tips.push({ icon: 'trending', title: 'Powerful Change', text: `Swapping beef for chicken just once a week saves ~104kg CO₂ per year. Going plant-based saves ~156kg!`, type: 'impact' });
      if (emission >= 7) {
        tips.push({ icon: 'tree', title: 'Offset Perspective', text: `To absorb ${emission}kg CO₂, a mature tree would need ${Math.ceil(emission / 22 * 365)} days of growth. Consider balancing with plant-based meals this week.`, type: 'warning' });
      }
    }

    addEmission(emission, 'Food');
    addLog({ category: 'Food', emission, message: `Logged Food: ${safeType} (${servings} servings)` });
    setRecentTips(tips);
    if (!macroSrv) setFoodServings('');
  };

  const handleEnergyLog = (macroAction?: string, macroDuration?: string) => {
    const rawVal = parseFloat(macroDuration ?? energyDuration) || 0;
    const action = macroAction ?? energyAction;
    const result = ActivityInputSchema.safeParse({ category: 'Energy', value: rawVal, label: action });
    if (!result.success) {
      console.error(result.error.issues[0].message);
      return;
    }
    const hours = result.data.value;
    const safeAction = result.data.label;
    let emission = 0;
    const tips: Tip[] = [];

    if (energyAction.includes('Renewable')) {
      emission = +(hours * 0.1).toFixed(1);
      tips.push({ icon: 'sun', title: 'Clean Energy!', text: `Using renewables for ${hours} hours produced only ${emission}kg CO₂ — 83% less than standard grid power!`, type: 'positive' });
      tips.push({ icon: 'wind', title: 'Grid Independence', text: `${hours} hours on renewables means you avoided ~${+(hours * 0.5).toFixed(1)}kg CO₂ from fossil fuel generation.`, type: 'impact' });
      if (hours >= 8) {
        tips.push({ icon: 'sparkles', title: 'Full-Day Green', text: `${hours}+ hours on renewables! If you can, consider a home solar panel — it pays for itself in 5-8 years and eliminates energy emissions.`, type: 'suggestion' });
      }
      if (hours >= 12) {
        tips.push({ icon: 'target', title: 'Energy Champion', text: `Running ${hours} hours on clean energy is like planting ${Math.ceil(hours * 0.5 / 22 * 365 / 30)} saplings. You're making a real difference!`, type: 'positive' });
      }
    } else if (energyAction.includes('Saving Mode')) {
      emission = +(hours * 0.3).toFixed(1);
      tips.push({ icon: 'trending', title: 'Energy Reduced', text: `Energy saving mode for ${hours} hours cut your draw by ~50%, producing ${emission}kg CO₂ instead of ${+(hours * 0.6).toFixed(1)}kg.`, type: 'positive' });
      tips.push({ icon: 'leaf', title: 'Additional Savings', text: `Combine energy-saving mode with lower screen brightness to save an extra 15-25% power.`, type: 'suggestion' });
      if (hours >= 6) {
        tips.push({ icon: 'recycle', title: 'Smart Scheduling', text: `For ${hours}+ hours of use, enable automatic sleep/hibernate when idle. Even 5 minutes of idle time adds up over a year!`, type: 'suggestion' });
      }
      tips.push({ icon: 'target', title: 'Monthly Projection', text: `At this rate, using energy-saving mode daily saves ~${+(hours * 0.3 * 30).toFixed(0)}kg CO₂ per month compared to standard usage.`, type: 'impact' });
    } else if (energyAction.includes('Unplugged')) {
      emission = 0;
      tips.push({ icon: 'sparkles', title: 'Zero Waste Energy!', text: `Unplugging devices for ${hours} hours prevented all standby ("vampire") energy drain — pure zero emissions!`, type: 'positive' });
      tips.push({ icon: 'trending', title: 'Vampire Energy Facts', text: `The average home loses 5-10% of its electricity to standby devices. You just cut that to zero for ${hours} hours!`, type: 'impact' });
      if (hours >= 8) {
        tips.push({ icon: 'recycle', title: 'Smart Power Strips', text: `Use smart power strips that auto-cut power to devices when turned off. They can save ~$100/year on energy bills!`, type: 'suggestion' });
      }
      if (hours >= 12) {
        tips.push({ icon: 'tree', title: 'Annual Impact', text: `Unplugging for ${hours}+ hours daily could save ~${Math.round(hours * 0.05 * 365)}kWh per year — enough to power a fridge for ${Math.round(hours * 0.05 * 365 / 400)} months!`, type: 'impact' });
      }
      tips.push({ icon: 'leaf', title: 'Top Vampires', text: `Game consoles, cable boxes, and phone chargers are the worst standby offenders. Unplug them when not in use!`, type: 'suggestion' });
    } else {
      emission = +(hours * 0.6).toFixed(1);
      tips.push({ icon: 'flame', title: 'Standard Grid Usage', text: `${hours} hours of grid power produced ${emission}kg CO₂. The grid still relies heavily on fossil fuels in most regions.`, type: 'warning' });
      if (hours <= 2) {
        tips.push({ icon: 'leaf', title: 'Quick Win', text: `For short usage periods, switch to energy-saving mode to halve emissions to ${+(hours * 0.3).toFixed(1)}kg CO₂.`, type: 'suggestion' });
      } else if (hours <= 6) {
        tips.push({ icon: 'sun', title: 'Go Renewable', text: `For ${hours} hours of use, switching to a green energy provider could save ${+(hours * 0.5).toFixed(1)}kg CO₂ — every session!`, type: 'suggestion' });
      } else {
        tips.push({ icon: 'wind', title: 'High Usage Alert', text: `${hours} hours is significant. Consider a renewable energy plan — it would reduce this ${emission}kg to just ${+(hours * 0.1).toFixed(1)}kg CO₂.`, type: 'suggestion' });
      }
      tips.push({ icon: 'trending', title: 'Simple Habits', text: `Switch off lights when leaving rooms, use LED bulbs, and unplug chargers — these small actions cut home energy use by 15%.`, type: 'suggestion' });
      if (emission >= 3) {
        tips.push({ icon: 'tree', title: 'Offset Reality', text: `${emission}kg CO₂ needs a mature tree ~${Math.ceil(emission / 22 * 365)} days to absorb. Reducing usage is far more effective than offsetting!`, type: 'warning' });
      }
    }

    addEmission(emission, 'Energy');
    addLog({ category: 'Energy', emission, message: `Logged Energy: ${safeAction} (${hours} hrs)` });
    setRecentTips(tips);
    if (!macroDuration) setEnergyDuration('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-400 transition-colors duration-500">Carbon Tracker</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 transition-colors duration-500 mb-3">Record your daily activities to track your carbon footprint.</p>
        </div>
      </div>
      
      {/* 1-Tap Quick Actions */}
      <div className="mb-6 space-y-3">
        <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">1-Tap Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleTransportLog('Public Transit (Bus/Train)', '5')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-100/70 dark:border-blue-900/30 rounded-lg text-xs font-semibold transition-all hover:scale-102 duration-200 shadow-sm"
          >
            <TrainFront className="w-3.5 h-3.5" /> Metro (5km)
          </button>
          <button 
            onClick={() => handleFoodLog('Vegan Meal', '1')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-100/70 dark:border-emerald-900/30 rounded-lg text-xs font-semibold transition-all hover:scale-102 duration-200 shadow-sm"
          >
            <Leaf className="w-3.5 h-3.5" /> Plant-Based (1 srv)
          </button>
          <button 
            onClick={() => handleEnergyLog('Unplugged Unused Devices', '8')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-100/70 dark:border-amber-900/30 rounded-lg text-xs font-semibold transition-all hover:scale-102 duration-200 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" /> Unplug Devices (8h)
          </button>
        </div>
      </div>

      {recentTips.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-top-3 duration-500">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-xl shadow-md shadow-emerald-500/20 animate-pulse">
                <Lightbulb className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Eco-Insights & Recommendations</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Tailored actions based on your logged activity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {recentTips.length} Active {recentTips.length === 1 ? 'Tip' : 'Tips'}
              </span>
              <button
                onClick={() => setRecentTips([])}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-all duration-200"
                title="Dismiss all tips"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentTips.map((tip, i) => {
              const styles = tipTypeStyles[tip.type];
              const IconComp = tipIconMap[tip.icon];
              
              // Get category badge text and style based on tip type
              const badgeLabel = {
                positive: 'Eco-Win',
                suggestion: 'Action Item',
                impact: 'Insight',
                warning: 'Alert'
              }[tip.type];

              return (
                <div
                  key={i}
                  className={`group relative overflow-hidden p-5 rounded-2xl border ${styles.border} ${styles.bg} backdrop-blur-md flex gap-4 items-start shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Glowing background gradient on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 bg-gradient-to-r from-emerald-400 to-teal-400" />
                  
                  <div className={`p-2.5 ${styles.iconBg} ${styles.iconColor} rounded-xl shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className={`text-xs font-black ${styles.titleColor} uppercase tracking-wider`}>
                        {tip.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.iconBg} ${styles.iconColor} border border-current/10 shrink-0`}>
                        {badgeLabel}
                      </span>
                    </div>
                    <p className={`text-sm ${styles.textColor} leading-relaxed font-medium`}>
                      {tip.text}
                    </p>
                  </div>

                  <button
                    onClick={() => setRecentTips(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all duration-200"
                    title="Dismiss tip"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transportation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Transportation</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Mode of Transport</label>
              <CustomSelect 
                value={transportMode}
                onChange={setTransportMode}
                options={[
                  'Public Transit (Bus/Train)',
                  'Bicycle / Walking',
                  'Electric Vehicle',
                  'Gasoline Car'
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Distance (km)</label>
              <input 
                type="number" 
                value={transportDistance}
                onChange={(e) => setTransportDistance(e.target.value)}
                placeholder="e.g. 15" 
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" 
              />
            </div>
          </div>
          <button 
            onClick={() => handleTransportLog()}
            disabled={!transportDistance || parseFloat(transportDistance) <= 0}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Transport
          </button>
        </div>

        {/* Food */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Utensils className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Food & Diet</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Meal Type</label>
              <CustomSelect 
                value={foodType}
                onChange={setFoodType}
                options={[
                  'Vegan Meal',
                  'Vegetarian Meal',
                  'Chicken / Fish',
                  'Beef / Lamb (High Impact)'
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Servings</label>
              <input 
                type="number" 
                value={foodServings}
                onChange={(e) => setFoodServings(e.target.value)}
                placeholder="e.g. 0" 
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" 
              />
            </div>
          </div>
          <button 
            onClick={() => handleFoodLog()}
            disabled={!foodServings || parseFloat(foodServings) <= 0}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Meal
          </button>
        </div>

        {/* Energy */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Energy Source</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Energy Action</label>
              <CustomSelect 
                value={energyAction}
                onChange={setEnergyAction}
                options={[
                  'Renewable Source (Solar/Wind)',
                  'Energy Saving Mode Used',
                  'Unplugged Unused Devices',
                  'Standard Grid Usage'
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Duration (Hours)</label>
              <input 
                type="number" 
                value={energyDuration}
                onChange={(e) => setEnergyDuration(e.target.value)}
                placeholder="e.g. 4" 
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" 
              />
            </div>
          </div>
          <button 
            onClick={() => handleEnergyLog()}
            disabled={!energyDuration || parseFloat(energyDuration) <= 0}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Energy
          </button>
        </div>
      </div>

      {(() => {
        const visibleLogs = logs.filter(log => !hiddenLogIds.includes(log.id));
        if (visibleLogs.length === 0) return null;
        return (
          <div className="bg-white dark:bg-slate-900 p-6 justify-center rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800/80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Recent Footprint Records</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHiddenLogIds(prev => [...prev, ...visibleLogs.map(l => l.id)])}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all duration-200 flex items-center gap-1"
                  title="Dismiss all records from this view"
                >
                  <X className="w-3.5 h-3.5" /> Dismiss All
                </button>
                <button
                  onClick={() => deleteLogs(visibleLogs.map(l => l.id))}
                  className="px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all duration-200 flex items-center gap-1"
                  title="Delete all records permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete All
                </button>
              </div>
            </div>
            <div className={`space-y-2 ${visibleLogs.length > 3 ? "max-h-[220px] overflow-y-auto pr-2" : ""}`}>
              {visibleLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center text-sm p-3 bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-100/70 dark:border-emerald-900/30 group">
                  <div className="flex flex-col gap-1">
                    <span>{log.message}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded w-fit">Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                      title="Delete footprint permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHiddenLogIds(prev => [...prev, log.id])}
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                      title="Dismiss card"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
