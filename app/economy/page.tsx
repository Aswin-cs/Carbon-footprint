"use client";

import { useState, useEffect } from 'react';
import { Gift, Navigation, TreePine, Droplet, Wind, Sun, Award, ShieldCheck, CheckCircle2, Flame } from 'lucide-react';
import { useEco } from '@/components/eco-provider';

export default function Economy() {
  const { logs, redeemedRewards, redeemReward, currentStreak, earnedBadgesMap } = useEco();

  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRedeem = (id: string) => {
    if (!redeemedRewards.includes(id)) {
      redeemReward(id);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const REWARDS = [
    { id: 'tree_1', name: 'Plant 1 Tree', icon: <TreePine className="w-8 h-8 text-emerald-500" />, desc: 'Partner with global NGOs to plant a tree in your name.' },
    { id: 'water_1', name: 'Clean 10L Water', icon: <Droplet className="w-8 h-8 text-blue-500" />, desc: 'Fund the removal of plastic from oceans and rivers.' },
    { id: 'solar_1', name: 'Solar Project', icon: <Sun className="w-8 h-8 text-amber-500" />, desc: 'Contribute to community solar panel installations.' },
    { id: 'wind_1', name: 'Wind Energy', icon: <Wind className="w-8 h-8 text-teal-500" />, desc: 'Support wind farm development in rural areas.' },
  ];

  const BADGES = [
    { id: 'act_1', name: 'First Step', desc: 'Log your first eco-action', active: logs.length >= 1, progress: Math.min(logs.length, 1) / 1, text: `${Math.min(logs.length, 1)}/1 logs`, icon: <CheckCircle2 className={`w-6 h-6 ${logs.length >= 1 ? 'text-emerald-500' : 'text-slate-400'}`} /> },
    { id: 'streak_1', name: 'Daily Starter', desc: 'Complete 1-day eco streak', active: currentStreak >= 1, progress: Math.min(currentStreak, 1) / 1, text: `${Math.min(currentStreak, 1)}/1 days`, icon: <Flame className={`w-6 h-6 ${currentStreak >= 1 ? 'text-orange-500' : 'text-slate-400'}`} /> },
    { id: 'streak_3', name: 'Habit Builder', desc: 'Complete 3-day eco streak', active: currentStreak >= 3, progress: Math.min(currentStreak, 3) / 3, text: `${Math.min(currentStreak, 3)}/3 days`, icon: <Flame className={`w-6 h-6 ${currentStreak >= 3 ? 'text-orange-500' : 'text-slate-400'}`} /> },
    { id: 'streak_7', name: 'Eco Champion', desc: 'Complete 7-day eco streak', active: currentStreak >= 7, progress: Math.min(currentStreak, 7) / 7, text: `${Math.min(currentStreak, 7)}/7 days`, icon: <Flame className={`w-6 h-6 ${currentStreak >= 7 ? 'text-orange-500' : 'text-slate-400'}`} /> },
    { id: 'act_10', name: 'Consistency', desc: 'Log 10 eco-actions', active: logs.length >= 10, progress: Math.min(logs.length, 10) / 10, text: `${Math.min(logs.length, 10)}/10 logs`, icon: <ShieldCheck className={`w-6 h-6 ${logs.length >= 10 ? 'text-blue-500' : 'text-slate-400'}`} /> },
    { id: 'tree_planter', name: 'Tree Planter', desc: 'Support a tree planting initiative', active: redeemedRewards.includes('tree_1'), progress: redeemedRewards.includes('tree_1') ? 1 : 0, text: `${redeemedRewards.includes('tree_1') ? 1 : 0}/1 reward`, icon: <TreePine className={`w-6 h-6 ${redeemedRewards.includes('tree_1') ? 'text-emerald-600' : 'text-slate-400'}`} /> },
  ];

  if (!mounted) {
    return <div className="space-y-8 animate-in fade-in duration-500 min-h-[50vh]" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
           <div className="text-4xl animate-bounce">🎉🌳 Success! 🌊✨</div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight transition-colors duration-500">Initiatives & Badges</h1>
          <p className="text-xs text-slate-500 mt-1 transition-colors duration-500 mb-3">Support eco-initiatives and earn unique impact badges.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Community Initiatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REWARDS.map(reward => {
                const isRedeemed = redeemedRewards.includes(reward.id);
                return (
                  <div key={reward.id} className={`p-4 rounded-lg border flex flex-col justify-between transition-all duration-300 ${isRedeemed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-white border-slate-200'}`}>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                         <div className="p-2 bg-white rounded-md shadow-sm border border-slate-150 flex items-center justify-center">
                            {reward.icon}
                         </div>
                         {isRedeemed && (
                           <span className="font-sans text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                             <CheckCircle2 className="w-3 h-3 text-emerald-600"/> Supported
                           </span>
                         )}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">{reward.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{reward.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleRedeem(reward.id)}
                      disabled={isRedeemed}
                      className={`w-full py-2 rounded-md text-xs font-bold transition-all ${
                        isRedeemed 
                          ? 'bg-emerald-100/80 text-emerald-700 cursor-not-allowed border border-emerald-200/50' 
                          : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.98]'
                      }`}
                    >
                      {isRedeemed ? 'Already Supported' : 'Support Initiative'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Your Badges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES.map(badge => (
                <div key={badge.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${badge.active ? 'bg-white border-emerald-400 shadow-sm ring-1 ring-emerald-100/50' : 'bg-white border-slate-200 opacity-90'}`}>
                  <div className={`p-2 rounded-full shrink-0 flex items-center justify-center ${badge.active ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold ${badge.active ? 'text-slate-800' : 'text-slate-500'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-xs ${badge.active ? 'text-slate-600' : 'text-slate-400'} ${!badge.active ? 'mb-2' : ''}`}>{badge.desc}</p>
                    
                    {!badge.active && (
                      <div className="w-full mt-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                          <span>Progress</span>
                          <span>{badge.text}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-400 h-1.5 rounded-full transition-all duration-1000" 
                            style={{ width: `${badge.progress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Timeline */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Achievements Timeline</h2>
            
            <div className="space-y-4">
              {BADGES.filter(b => b.active).sort((a, b) => {
                const valA = earnedBadgesMap[a.id];
                const valB = earnedBadgesMap[b.id];
                const timeA = valA ? new Date(valA).getTime() : 0;
                const timeB = valB ? new Date(valB).getTime() : 0;
                const safeA = isNaN(timeA) ? 0 : timeA;
                const safeB = isNaN(timeB) ? 0 : timeB;
                return safeB - safeA;
              }).map((badge, idx, arr) => {
                const dateVal = earnedBadgesMap[badge.id];
                const parsedDate = dateVal ? new Date(dateVal) : null;
                const date = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : new Date();
                
                return (
                  <div key={badge.id} className="relative pl-6">
                    {/* Vertical line connecting milestones */}
                    {idx !== arr.length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-slate-200" />
                    )}
                    
                    {/* Timeline dot */}
                    <div className="absolute left-[-2px] top-1 w-7 h-7 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>

                    <div className="bg-white rounded-lg p-4 flex gap-4 items-center border border-slate-200">
                      <div className="p-2 bg-white border border-slate-150 rounded-full shadow-sm shrink-0">
                         {badge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-col sm:flex-row sm:items-center">
                          <h3 className="font-bold text-slate-800 text-sm">{badge.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 sm:mt-0">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{badge.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {BADGES.filter(b => b.active).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm relative">
                   <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-slate-100" />
                   <div className="absolute left-[-2px] top-4 w-7 h-7 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                   </div>
                   <div className="pl-6 text-slate-400">
                     Complete your first action to start your timeline!
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
