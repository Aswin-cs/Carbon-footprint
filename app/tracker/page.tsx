"use client";

import { useState } from 'react';
import { Activity, Car, Utensils, Zap, Plus, Lightbulb, Trash2, X } from 'lucide-react';
import { useEco } from '@/components/eco-provider';
import { CustomSelect } from '@/components/custom-select';

export default function Tracker() {
  const { addEmission, logs, addLog, deleteLog } = useEco();

  const [transportMode, setTransportMode] = useState('Public Transit (Bus/Train)');
  const [transportDistance, setTransportDistance] = useState('');

  const [foodType, setFoodType] = useState('Vegan Meal');
  const [foodServings, setFoodServings] = useState('0');

  const [energyAction, setEnergyAction] = useState('Renewable Source (Solar/Wind)');
  const [energyDuration, setEnergyDuration] = useState('');

  const [recentTip, setRecentTip] = useState<string | null>(null);
  const [hiddenLogIds, setHiddenLogIds] = useState<string[]>([]);

  const handleTransportLog = () => {
    const dist = parseFloat(transportDistance) || 0;
    if (dist <= 0) return;
    let emission = 0;
    let tip = "";

    if (transportMode.includes('Bicycle')) {
      emission = 0;
      tip = `Awesome! Biking ${dist}km saves significant emissions compared to driving. Keep it up!`;
    } else if (transportMode.includes('Public')) {
      emission = +(dist * 0.05).toFixed(1);
      tip = `Taking public transit for ${dist}km is a great eco-friendly choice, reducing traffic and emissions.`;
    } else if (transportMode.includes('Electric')) {
      emission = +(dist * 0.08).toFixed(1);
      tip = `Driving an EV for ${dist}km helps reduce direct tailpipe emissions.`;
    } else {
      emission = +(dist * 0.2).toFixed(1);
      tip = `Driving a gasoline car ${dist}km generated some emissions. Consider carpooling or public transit for your next trip!`;
    }
    
    addEmission(emission, 'Transport');
    addLog({ category: 'Transport', emission, message: `Logged Transport: ${transportMode} (${dist}km)` });
    setRecentTip(tip);
    setTransportDistance('');
  };

  const handleFoodLog = () => {
    const servings = parseFloat(foodServings) || 0;
    if (servings <= 0) return;
    let emission = 0;
    let tip = "";

    if (foodType.includes('Vegan')) {
      emission = +(servings * 0.5).toFixed(1);
      tip = `A vegan meal has the lowest carbon footprint! You saved a substantial amount of water and emissions.`;
    } else if (foodType.includes('Vegetarian')) {
      emission = +(servings * 0.8).toFixed(1);
      tip = `Vegetarian meals require significantly fewer resources than meat-based ones. Great choice!`;
    } else if (foodType.includes('Chicken')) {
      emission = +(servings * 1.5).toFixed(1);
      tip = `Chicken and fish have a lower footprint than beef, but consider trying a plant-based option next time!`;
    } else {
      emission = +(servings * 3.5).toFixed(1);
      tip = `Beef and lamb are very carbon-intensive. Swapping even one red meat meal a week makes a huge difference!`;
    }

    addEmission(emission, 'Food');
    addLog({ category: 'Food', emission, message: `Logged Food: ${foodType} (${servings} servings)` });
    setRecentTip(tip);
    setFoodServings('1');
  };

  const handleEnergyLog = () => {
    const hours = parseFloat(energyDuration) || 0;
    if (hours <= 0) return;
    let emission = 0;
    let tip = "";

    if (energyAction.includes('Renewable')) {
      emission = +(hours * 0.1).toFixed(1);
      tip = `Using renewable energy for ${hours} hours directly cuts reliance on fossil fuels.`;
    } else if (energyAction.includes('Saving Mode')) {
      emission = +(hours * 0.3).toFixed(1);
      tip = `Running devices in energy saving mode for ${hours} hours reduces your overall power draw.`;
    } else if (energyAction.includes('Unplugged')) {
      emission = 0;
      tip = `Unplugging unused devices for ${hours} hours prevents 'vampire' energy drain. Good habit!`;
    } else {
      emission = +(hours * 0.6).toFixed(1);
      tip = `Standard grid usage for ${hours} hours. Try switching off lights when leaving the room to further reduce it.`;
    }

    addEmission(emission, 'Energy');
    addLog({ category: 'Energy', emission, message: `Logged Energy: ${energyAction} (${hours} hrs)` });
    setRecentTip(tip);
    setEnergyDuration('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-400 transition-colors duration-500">Carbon Tracker</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 transition-colors duration-500 mb-3">Record your daily activities to track your carbon footprint.</p>
        </div>
      </div>
      
      {recentTip && (
        <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100 flex gap-4 items-start shadow-sm animate-in slide-in-from-top-2 sticky top-4 z-50 md:static md:top-auto md:z-auto">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-800 mb-1">Impact Insight</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">{recentTip}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transportation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700">Transportation</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mode of Transport</label>
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
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Distance (km)</label>
              <input 
                type="number" 
                value={transportDistance}
                onChange={(e) => setTransportDistance(e.target.value)}
                placeholder="e.g. 15" 
                className="w-full p-2 border border-slate-200 rounded text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
          </div>
          <button 
            onClick={handleTransportLog}
            disabled={!transportDistance || parseFloat(transportDistance) <= 0}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Transport
          </button>
        </div>

        {/* Food */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Utensils className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700">Food & Diet</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Meal Type</label>
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
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Servings</label>
              <input 
                type="number" 
                value={foodServings}
                onChange={(e) => setFoodServings(e.target.value)}
                placeholder="1" 
                className="w-full p-2 border border-slate-200 rounded text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
          </div>
          <button 
            onClick={handleFoodLog}
            disabled={!foodServings || parseFloat(foodServings) <= 0}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Meal
          </button>
        </div>

        {/* Energy */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700">Energy Source</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Energy Action</label>
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
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Duration (Hours)</label>
              <input 
                type="number" 
                value={energyDuration}
                onChange={(e) => setEnergyDuration(e.target.value)}
                placeholder="e.g. 4" 
                className="w-full p-2 border border-slate-200 rounded text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
          </div>
          <button 
            onClick={handleEnergyLog}
            disabled={!energyDuration || parseFloat(energyDuration) <= 0}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Energy
          </button>
        </div>
      </div>

      {(() => {
        const visibleLogs = logs.filter(log => !hiddenLogIds.includes(log.id));
        if (visibleLogs.length === 0) return null;
        return (
          <div className="bg-white p-6 justify-center rounded-lg shadow-sm border border-emerald-200">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Recent Footprint Records</h3>
            <div className={`space-y-2 ${visibleLogs.length > 3 ? "max-h-[220px] overflow-y-auto pr-2" : ""}`}>
              {visibleLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center text-sm p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 group">
                  <div className="flex flex-col gap-1">
                    <span>{log.message}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded w-fit">Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-1.5 text-emerald-600 hover:text-red-600 hover:bg-white rounded transition-colors"
                      title="Delete footprint permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHiddenLogIds(prev => [...prev, log.id])}
                      className="p-1.5 text-emerald-600 hover:text-slate-600 hover:bg-white rounded transition-colors"
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
