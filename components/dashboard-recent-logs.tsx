"use client";

import { useState, useMemo } from 'react';
import { ArrowUpDown, Filter, Trash2, Download } from 'lucide-react';
import { CustomSelect } from '@/components/custom-select';
import { LogEntry } from '@/components/eco-provider';

export interface DashboardRecentLogsProps {
  logs: LogEntry[];
  hasRealData: boolean;
  selectedDay: string | null;
  filterCategory: string;
  setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
  deleteLogs: (ids: string[]) => void;
}

export function DashboardRecentLogs({
  logs,
  hasRealData,
  selectedDay,
  filterCategory,
  setFilterCategory,
  deleteLogs
}: DashboardRecentLogsProps) {
  const [sortColumn, setSortColumn] = useState<keyof LogEntry>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const mockLogsList: LogEntry[] = useMemo(() => {
    if (hasRealData) return [];
    const fake: LogEntry[] = [];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayLabels.forEach((dayLabel, idx) => {
      const dayOffset = dayLabel === 'Sun' ? 1 : idx + 2;
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

  const handleSort = (column: keyof LogEntry) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

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
  }, [logs, mockLogsList, sortColumn, sortDirection, filterCategory, selectedDay, hasRealData]);

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

  const handleDeleteSelected = () => {
    if (selectedLogs.length > 0) {
      deleteLogs(selectedLogs);
      setSelectedLogs([]);
    }
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          {selectedDay ? `${selectedDay}'s Footprints` : 'Footprint Log'}
        </h2>
        {(hasRealData ? logs.length > 0 : mockLogsList.length > 0) && (
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 no-capture">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded hover:bg-emerald-100 transition-colors mr-2"
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
            {filteredAndSortedLogs.map((log) => (
              <div 
                key={log.id} 
                className={`p-4 border rounded-lg flex flex-col gap-2 transition-colors ${selectedLogs.includes(log.id) ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'}`}
                onClick={() => toggleSelectLog(log.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 no-capture"
                      checked={selectedLogs.includes(log.id)}
                      onChange={() => toggleSelectLog(log.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-800">{log.category}</div>
                      <div className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-800">{log.emission.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg CO₂e</span></div>
                </div>
                <div className="text-sm text-slate-600 mt-1 pl-7">{log.message}</div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table Layout) */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center no-capture">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={filteredAndSortedLogs.length > 0 && selectedLogs.length === filteredAndSortedLogs.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date {sortColumn === 'date' && <ArrowUpDown className="w-3 h-3 text-emerald-600" />}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                      Category {sortColumn === 'category' && <ArrowUpDown className="w-3 h-3 text-emerald-600" />}
                    </div>
                  </th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('emission')}>
                    <div className="flex items-center justify-end gap-1">
                      Emissions {sortColumn === 'emission' && <ArrowUpDown className="w-3 h-3 text-emerald-600" />}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                {filteredAndSortedLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedLogs.includes(log.id) ? 'bg-emerald-50/30' : ''}`}
                    onClick={() => toggleSelectLog(log.id)}
                  >
                    <td className="px-4 py-3 text-center no-capture">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => toggleSelectLog(log.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{log.category}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={log.message}>{log.message}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{log.emission.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg CO₂e</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAndSortedLogs.length === 0 && (
              <div className="p-8 text-center text-slate-500">No footprints match the selected filters.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
