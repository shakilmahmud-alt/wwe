import React, { useMemo } from 'react';
import { ArchiveEntry } from '../types';
import { History, Trophy } from 'lucide-react';

interface ChampListViewProps {
  archive: ArchiveEntry[];
  onUpdateArchiveEntry: (entry: ArchiveEntry) => void;
}

export const ChampListView: React.FC<ChampListViewProps> = ({
  archive,
  onUpdateArchiveEntry
}) => {

  const handleCellChange = (entry: ArchiveEntry | undefined, field: keyof ArchiveEntry, value: string, brand: 'RAW'|'SmackDown'|'NXT'|'Joint', titleName: string, order: number) => {
    let newEntry: ArchiveEntry;
    
    if (entry) {
      newEntry = { ...entry, [field]: value };
    } else {
      // If it doesn't exist, create it on the fly
      newEntry = {
        id: `${brand}-${titleName}-${order}-${Date.now()}`,
        brand,
        titleName,
        who: field === 'who' ? value : '',
        times: field === 'times' ? value : '',
        reign: field === 'reign' ? value : '',
        month: field === 'month' ? value : '',
        order
      };
    }

    // Auto-calculate months if reign (days) is changed
    if (field === 'reign') {
      const days = parseInt(value, 10);
      if (!isNaN(days)) {
        newEntry.month = Math.round(days / 30).toString();
      } else if (value === '') {
        newEntry.month = '';
      }
    }

    onUpdateArchiveEntry(newEntry);
  };

  const renderTable = (
    brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint',
    titles: string[],
    themeColor: string,
    bgColorClass: string,
    headerBgClass: string
  ) => {
    // Group by title
    const grouped = titles.reduce((acc, title) => {
      acc[title] = archive.filter(a => a.brand === brand && a.titleName === title).sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<string, ArchiveEntry[]>);

    const maxRows = Math.max(...titles.map(t => grouped[t]?.length || 0), 10); // at least 10 rows

    const maxStats = titles.reduce((acc, title) => {
      acc[title] = {
        times: Math.max(...grouped[title].map(a => Number(a.times) || 0), 1),
        reign: Math.max(...grouped[title].map(a => Number(a.reign) || 0), 1),
        month: Math.max(...grouped[title].map(a => Number(a.month) || 0), 1)
      };
      return acc;
    }, {} as Record<string, { times: number; reign: number; month: number }>);

    return (
      <div className={`border ${themeColor} shadow-2xl flex-none min-w-max bg-black/40`}>
        <div className="w-full">
          <table className={`w-full text-center text-sm ${bgColorClass} whitespace-nowrap`}>
            <thead className="sticky top-0 z-20 shadow-xl">
              <tr className={headerBgClass}>
                {titles.map(title => (
                  <th key={title} colSpan={4} className={`p-2 border-b-2 border-r-4 border-slate-900 font-black tracking-wide uppercase text-white`}>
                    {title}
                  </th>
                ))}
              </tr>
              <tr className="bg-black/30 border-b-4 border-black font-bold text-slate-100">
                {titles.map(title => (
                  <React.Fragment key={`${title}-sub`}>
                    <th className="p-1 border-r border-black w-40">Who</th>
                    <th className="p-1 border-r border-black w-16">Times</th>
                    <th className="p-1 border-r border-black w-20">Reign</th>
                    <th className="p-1 border-r-4 border-slate-900 w-16">Month</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }).map((_, idx) => {
                const order = idx + 1;
                return (
                  <tr key={order} className="border-b border-black/20 hover:bg-white/10 transition">
                    {titles.map(title => {
                      const entry = grouped[title].find(a => a.order === order);
                      const tVal = Number(entry?.times) || 0;
                      const rVal = Number(entry?.reign) || 0;
                      const mVal = Number(entry?.month) || 0;
                      
                      const tPct = (tVal / maxStats[title].times) * 100;
                      const rPct = (rVal / maxStats[title].reign) * 100;
                      const mPct = (mVal / maxStats[title].month) * 100;

                      return (
                        <React.Fragment key={`${title}-${order}`}>
                          <td className="p-0 border-r border-black/20">
                            <input
                              className="w-full text-center bg-transparent outline-none p-1 focus:bg-black/20"
                              value={entry?.who || ''}
                              onChange={e => handleCellChange(entry, 'who', e.target.value, brand, title, order)}
                            />
                          </td>
                          <td 
                            className="p-0 border-r border-black/20 font-semibold"
                            style={entry?.times ? { background: `linear-gradient(to right, rgba(250, 204, 21, 0.4) ${tPct}%, rgba(255,255,255,0.05) ${tPct}%)` } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                          >
                            <input
                              className="w-full text-center bg-transparent outline-none p-1 focus:bg-black/20 text-orange-200"
                              value={entry?.times || ''}
                              onChange={e => handleCellChange(entry, 'times', e.target.value, brand, title, order)}
                            />
                          </td>
                          <td 
                            className="p-0 border-r border-black/20 font-bold"
                            style={entry?.reign ? { background: `linear-gradient(to right, rgba(74, 222, 128, 0.35) ${rPct}%, rgba(255,255,255,0.1) ${rPct}%)` } : { backgroundColor: 'rgba(255,255,255,0.1)' }}
                          >
                            <input
                              className="w-full text-center bg-transparent outline-none p-1 focus:bg-black/20 text-emerald-300"
                              value={entry?.reign || ''}
                              onChange={e => handleCellChange(entry, 'reign', e.target.value, brand, title, order)}
                            />
                          </td>
                          <td 
                            className="p-0 border-r-4 border-slate-900 font-semibold"
                            style={entry?.month ? { background: `linear-gradient(to right, rgba(96, 165, 250, 0.4) ${mPct}%, rgba(0,0,0,0.1) ${mPct}%)` } : { backgroundColor: 'rgba(0,0,0,0.1)' }}
                          >
                            <input
                              className="w-full text-center bg-transparent outline-none p-1 focus:bg-black/20 text-cyan-200"
                              value={entry?.month || ''}
                              onChange={e => handleCellChange(entry, 'month', e.target.value, brand, title, order)}
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSummaryBoard = () => {
    const allBelts = [
      { brand: 'RAW', title: 'WWE/World Heavyweight', theme: 'from-red-950 to-red-900/40 border-red-500/50' },
      { brand: 'RAW', title: 'Intercontinental (3)', theme: 'from-red-950 to-red-900/40 border-red-500/50' },
      { brand: 'RAW', title: 'RAW/World Tag Team (7)', theme: 'from-red-950 to-red-900/40 border-red-500/50' },
      { brand: 'RAW', title: "RAW Women's/Women's World", theme: 'from-red-950 to-red-900/40 border-red-500/50' },
      { brand: 'RAW', title: "Women's Intercontinental", theme: 'from-red-950 to-red-900/40 border-red-500/50' },
      { brand: 'SmackDown', title: 'Universal/Undisputed WWE Championship', theme: 'from-blue-950 to-blue-900/40 border-blue-500/50' },
      { brand: 'SmackDown', title: 'United States (3)', theme: 'from-blue-950 to-blue-900/40 border-blue-500/50' },
      { brand: 'SmackDown', title: 'SD/WWE Tag Team (7)', theme: 'from-blue-950 to-blue-900/40 border-blue-500/50' },
      { brand: 'SmackDown', title: "SD/WWE Women's", theme: 'from-blue-950 to-blue-900/40 border-blue-500/50' },
      { brand: 'SmackDown', title: "Women's US", theme: 'from-blue-950 to-blue-900/40 border-blue-500/50' },
      { brand: 'NXT', title: 'NXT (5)', theme: 'from-yellow-950 to-yellow-900/40 border-yellow-500/50' },
      { brand: 'NXT', title: 'North American (3)', theme: 'from-yellow-950 to-yellow-900/40 border-yellow-500/50' },
      { brand: 'NXT', title: 'Tag Team (7)', theme: 'from-yellow-950 to-yellow-900/40 border-yellow-500/50' },
      { brand: 'NXT', title: "NXT Women's", theme: 'from-yellow-950 to-yellow-900/40 border-yellow-500/50' },
      { brand: 'NXT', title: "Women's NXT NA", theme: 'from-yellow-950 to-yellow-900/40 border-yellow-500/50' },
      { brand: 'Joint', title: "Women's Tag Team", theme: 'from-emerald-950 to-emerald-900/40 border-emerald-500/50' }
    ];

    return (
      <div className="flex-none w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <h2 className="text-lg font-black uppercase text-slate-200 tracking-wider mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Championship Records Summary
        </h2>
        <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-2 snap-x">
          {allBelts.map((belt, idx) => {
            const beltEntries = archive.filter(a => a.brand === belt.brand && a.titleName === belt.title && a.who?.trim());
            
            let maxTimes = 0;
            let maxReign = 0;
            
            beltEntries.forEach(a => {
              const t = Number(a.times) || 0;
              const r = Number(a.reign) || 0;
              if (t > maxTimes) maxTimes = t;
              if (r > maxReign) maxReign = r;
            });

            const mostTimesWho = maxTimes > 0 
              ? beltEntries.filter(a => (Number(a.times) || 0) === maxTimes).map(a => a.who).join(', ') 
              : 'TBD';
              
            const longestReignWho = maxReign > 0 
              ? beltEntries.filter(a => (Number(a.reign) || 0) === maxReign).map(a => a.who).join(', ') 
              : 'TBD';

            return (
              <div key={idx} className={`snap-start flex-none w-72 p-3 bg-gradient-to-br ${belt.theme} border rounded-lg shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{belt.brand}</div>
                  <div className="text-sm font-black text-white leading-tight mb-3 h-10 truncate whitespace-normal line-clamp-2">{belt.title}</div>
                  
                  <div className="space-y-2">
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Most Reigns ({maxTimes > 0 ? maxTimes : '-'})</div>
                      <div className="text-sm font-semibold text-yellow-300 truncate" title={mostTimesWho}>{mostTimesWho}</div>
                    </div>
                    <div className="bg-black/40 rounded p-2 border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Longest Reign ({maxReign > 0 ? `${maxReign}d` : '-'})</div>
                      <div className="text-sm font-semibold text-emerald-300 truncate" title={longestReignWho}>{longestReignWho}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans h-[calc(100vh-90px)] flex flex-col">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-950/90 via-slate-900 to-pink-950/90 border border-purple-500/50 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4 flex-none">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl shadow-lg">
            <History className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-purple-300 tracking-wider">
              Historic Championship Archive
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              A fully editable manual spreadsheet for tracking historic WWE title reigns.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Board */}
      {renderSummaryBoard()}

      <div className="flex-1 min-h-0 flex items-start gap-8 overflow-auto pb-4 rounded-xl relative custom-scrollbar">
        {renderTable(
          'RAW',
          ['WWE/World Heavyweight', 'Intercontinental (3)', 'RAW/World Tag Team (7)', "RAW Women's/Women's World", "Women's Intercontinental"],
          'border-red-900',
          'bg-red-950/50',
          'bg-red-700'
        )}

        {renderTable(
          'SmackDown',
          ['Universal/Undisputed WWE Championship', 'United States (3)', 'SD/WWE Tag Team (7)', "SD/WWE Women's", "Women's US"],
          'border-blue-900',
          'bg-blue-950/50',
          'bg-blue-700'
        )}

        {renderTable(
          'NXT',
          ['NXT (5)', 'North American (3)', 'Tag Team (7)', "NXT Women's", "Women's NXT NA"],
          'border-yellow-900',
          'bg-yellow-900/40',
          'bg-yellow-600'
        )}

        {renderTable(
          'Joint',
          ["Women's Tag Team"],
          'border-emerald-900',
          'bg-emerald-950/50',
          'bg-emerald-700'
        )}
      </div>
    </div>
  );
};
