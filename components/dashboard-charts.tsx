"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export interface DashboardChartsProps {
  chartMode: 'total' | 'weekly';
  setChartMode: (mode: 'total' | 'weekly') => void;
  selectedDay: string | null;
  setSelectedDay: React.Dispatch<React.SetStateAction<string | null>>;
  chartData: { name: string; emissions: number; }[];
  displayCategoryEmissions: { name: string; value: number; }[];
  hasRealData: boolean;
  filterCategory: string;
  setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
}

export function DashboardCharts({
  chartMode,
  setChartMode,
  selectedDay,
  setSelectedDay,
  chartData,
  displayCategoryEmissions,
  hasRealData,
  filterCategory,
  setFilterCategory
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              {chartMode === 'total' ? 'Weekly Emissions' : 'Weekly Trends'} <span className="hidden sm:inline">(kg CO2e)</span>
            </h2>
            {chartMode === 'total' && selectedDay && (
              <span 
                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 cursor-pointer hover:bg-emerald-100" 
                onClick={() => setSelectedDay(null)}
              >
                {selectedDay} &times;
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!hasRealData && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded hidden sm:inline-block">Sample</span>}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setChartMode('total')}
                className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${chartMode === 'total' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Total
              </button>
              <button 
                onClick={() => {
                  setChartMode('weekly');
                  setSelectedDay(null);
                }}
                className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${chartMode === 'weekly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
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
                      aria-label={`${entry.name} emissions: ${entry.value} kg CO2e`}
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
  );
}
