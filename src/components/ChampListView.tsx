import React, { useState, useMemo } from 'react';
import { ArchiveEntry } from '../types';
import { History, Trophy, Plus, Trash2, Layers, Filter, Rows, Check } from 'lucide-react';

interface ChampListViewProps {
  archive: ArchiveEntry[];
  onUpdateArchiveEntry: (entry: ArchiveEntry) => void;
  onDeleteArchiveEntry?: (id: string) => void;
}

export const ChampListView: React.FC<ChampListViewProps> = ({
  archive,
  onUpdateArchiveEntry,
  onDeleteArchiveEntry
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<'All' | 'RAW' | 'SmackDown' | 'NXT' | 'Joint'>('All');
  const [minRows, setMinRows] = useState<number>(30); // Default to 30 visible rows for a tall spreadsheet
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const handleCellChange = (
    entry: ArchiveEntry | undefined,
    field: keyof ArchiveEntry,
    value: string,
    brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint',
    titleName: string,
    order: number
  ) => {
    let newEntry: ArchiveEntry;

    if (entry) {
      newEntry = { ...entry, [field]: value };
    } else {
      // Create new entry on the fly when typing in an empty cell
      newEntry = {
        id: `${brand}-${titleName.replace(/[^a-zA-Z0-9]/g, '_')}-${order}`,
        brand,
        titleName,
        who: field === 'who' ? value : '',
        times: field === 'times' ? value : '',
        reign: field === 'reign' ? value : '',
        month: field === 'month' ? value : '',
        order
      };
    }

    // Auto-calculate months if reign (days) is modified
    if (field === 'reign') {
      const days = parseInt(value, 10);
      if (!isNaN(days) && days > 0) {
        newEntry.month = Math.round(days / 30).toString();
      } else if (value === '') {
        newEntry.month = '';
      }
    }

    onUpdateArchiveEntry(newEntry);
    triggerSavedToast();
  };

  const triggerSavedToast = () => {
    setSavedNotification('Changes auto-saved to Database!');
    setTimeout(() => {
      setSavedNotification(null);
    }, 2000);
  };

  const handleClearRow = (entry: ArchiveEntry | undefined) => {
    if (!entry) return;
    if (onDeleteArchiveEntry) {
      onDeleteArchiveEntry(entry.id);
    } else {
      onUpdateArchiveEntry({ ...entry, who: '', times: '', reign: '', month: '' });
    }
    triggerSavedToast();
  };

  const renderTable = (
    brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint',
    titles: string[],
    themeColor: string,
    bgColorClass: string,
    headerBgClass: string
  ) => {
    // Group entries by title
    const grouped = titles.reduce((acc, title) => {
      acc[title] = archive
        .filter(a => a.brand === brand && a.titleName === title)
        .sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<string, ArchiveEntry[]>);

    // Calculate maximum rows needed, ensuring at least `minRows` (default 30)
    const currentMax = Math.max(...titles.map(t => grouped[t]?.length || 0), minRows);

    const maxStats = titles.reduce((acc, title) => {
      acc[title] = {
        times: Math.max(...grouped[title].map(a => Number(a.times) || 0), 1),
        reign: Math.max(...grouped[title].map(a => Number(a.reign) || 0), 1),
        month: Math.max(...grouped[title].map(a => Number(a.month) || 0), 1)
      };
      return acc;
    }, {} as Record<string, { times: number; reign: number; month: number }>);

    return (
      <div className={`border ${themeColor} shadow-2xl flex-none min-w-max bg-slate-950/80 rounded-xl overflow-hidden mb-6`}>
        {/* Table Title Bar with Add Row Action */}
        <div className={`px-4 py-2.5 ${headerBgClass} flex items-center justify-between border-b border-black/40`}>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black/40 rounded text-xs font-black uppercase text-white tracking-wider">
              {brand}
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              Championship Archive Spreadsheet ({titles.length} Titles)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMinRows(prev => prev + 10)}
              className="px-2.5 py-1 bg-black/40 hover:bg-black/60 text-white rounded text-xs font-bold flex items-center gap-1 border border-white/20 transition shadow"
              title="Add 10 more rows to this spreadsheet"
            >
              <Plus className="w-3.5 h-3.5" /> +10 Rows
            </button>
          </div>
        </div>

        <div className="w-full max-h-[70vh] overflow-y-auto custom-scrollbar">
          <table className={`w-full text-center text-xs ${bgColorClass} whitespace-nowrap border-collapse`}>
            <thead>
              {/* Row 1: Championship Names (Super Header) */}
              <tr className="sticky top-0 z-30 shadow-md">
                {titles.map(title => (
                  <th
                    key={title}
                    colSpan={4}
                    className={`p-2.5 border-b-2 border-r-4 border-slate-900 font-black tracking-wider uppercase text-white ${headerBgClass} text-center shadow-inner`}
                  >
                    {title}
                  </th>
                ))}
              </tr>
              {/* Row 2: Sub-headers (Who, Times, Reign, Month) */}
              <tr className="sticky top-[37px] z-20 bg-slate-900 border-b-2 border-black font-extrabold text-slate-200 shadow-md">
                {titles.map(title => (
                  <React.Fragment key={`${title}-sub`}>
                    <th className="p-2 border-r border-slate-800 min-w-[130px] text-slate-300">Who</th>
                    <th className="p-2 border-r border-slate-800 w-16 text-yellow-400">Times</th>
                    <th className="p-2 border-r border-slate-800 w-20 text-emerald-400">Reign</th>
                    <th className="p-2 border-r-4 border-slate-900 w-16 text-cyan-400">Month</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: currentMax }).map((_, idx) => {
                const order = idx + 1;
                return (
                  <tr key={order} className="border-b border-slate-800/60 hover:bg-white/10 transition group">
                    {titles.map(title => {
                      const entry = grouped[title].find(a => a.order === order);
                      const tVal = Number(entry?.times) || 0;
                      const rVal = Number(entry?.reign) || 0;
                      const mVal = Number(entry?.month) || 0;

                      const tPct = Math.min(100, (tVal / (maxStats[title].times || 1)) * 100);
                      const rPct = Math.min(100, (rVal / (maxStats[title].reign || 1)) * 100);
                      const mPct = Math.min(100, (mVal / (maxStats[title].month || 1)) * 100);

                      return (
                        <React.Fragment key={`${title}-${order}`}>
                          {/* Superstar Name (Who) */}
                          <td className="p-0 border-r border-slate-800/60 relative">
                            <div className="flex items-center">
                              <input
                                className="w-full text-center bg-transparent outline-none py-1.5 px-1 focus:bg-slate-900/90 text-white font-medium placeholder-slate-600"
                                value={entry?.who || ''}
                                placeholder="-"
                                onChange={e => handleCellChange(entry, 'who', e.target.value, brand, title, order)}
                              />
                              {entry?.who && (
                                <button
                                  onClick={() => handleClearRow(entry)}
                                  className="opacity-0 group-hover:opacity-100 absolute right-1 text-slate-500 hover:text-red-400 p-0.5 transition"
                                  title="Clear / Delete row"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Times Won */}
                          <td
                            className="p-0 border-r border-slate-800/60 font-semibold"
                            style={
                              entry?.times
                                ? { background: `linear-gradient(to right, rgba(250, 204, 21, 0.35) ${tPct}%, rgba(15, 23, 42, 0.4) ${tPct}%)` }
                                : { backgroundColor: 'rgba(15, 23, 42, 0.3)' }
                            }
                          >
                            <input
                              className="w-full text-center bg-transparent outline-none py-1.5 px-1 focus:bg-slate-900/90 text-yellow-300 font-bold placeholder-slate-700"
                              value={entry?.times || ''}
                              placeholder="-"
                              onChange={e => handleCellChange(entry, 'times', e.target.value, brand, title, order)}
                            />
                          </td>

                          {/* Days Held (Reign) */}
                          <td
                            className="p-0 border-r border-slate-800/60 font-bold"
                            style={
                              entry?.reign
                                ? { background: `linear-gradient(to right, rgba(74, 222, 128, 0.35) ${rPct}%, rgba(15, 23, 42, 0.4) ${rPct}%)` }
                                : { backgroundColor: 'rgba(15, 23, 42, 0.3)' }
                            }
                          >
                            <input
                              className="w-full text-center bg-transparent outline-none py-1.5 px-1 focus:bg-slate-900/90 text-emerald-300 font-extrabold placeholder-slate-700"
                              value={entry?.reign || ''}
                              placeholder="-"
                              onChange={e => handleCellChange(entry, 'reign', e.target.value, brand, title, order)}
                            />
                          </td>

                          {/* Months Held */}
                          <td
                            className="p-0 border-r-4 border-slate-900 font-semibold"
                            style={
                              entry?.month
                                ? { background: `linear-gradient(to right, rgba(96, 165, 250, 0.35) ${mPct}%, rgba(15, 23, 42, 0.4) ${mPct}%)` }
                                : { backgroundColor: 'rgba(15, 23, 42, 0.3)' }
                            }
                          >
                            <input
                              className="w-full text-center bg-transparent outline-none py-1.5 px-1 focus:bg-slate-900/90 text-cyan-300 font-bold placeholder-slate-700"
                              value={entry?.month || ''}
                              placeholder="-"
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
      <div className="flex-none w-full bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 shadow-xl">
        <h2 className="text-base font-black uppercase text-slate-200 tracking-wider mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Championship Records Summary Board
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
              <div
                key={idx}
                className={`snap-start flex-none w-64 p-3 bg-gradient-to-br ${belt.theme} border rounded-lg shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="relative z-10">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 mb-0.5">{belt.brand}</div>
                  <div className="text-xs font-black text-white leading-tight mb-2.5 h-8 truncate whitespace-normal line-clamp-2" title={belt.title}>
                    {belt.title}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="bg-black/50 rounded p-1.5 border border-white/5">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Most Reigns ({maxTimes > 0 ? maxTimes : '-'})</div>
                      <div className="text-xs font-bold text-yellow-300 truncate" title={mostTimesWho}>{mostTimesWho}</div>
                    </div>
                    <div className="bg-black/50 rounded p-1.5 border border-white/5">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Longest Reign ({maxReign > 0 ? `${maxReign}d` : '-'})</div>
                      <div className="text-xs font-bold text-emerald-300 truncate" title={longestReignWho}>{longestReignWho}</div>
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

  const totalFilledEntries = useMemo(() => {
    return archive.filter(a => a.who?.trim()).length;
  }, [archive]);

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans min-h-screen flex flex-col">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-purple-950/90 via-slate-900 to-pink-950/90 border border-purple-500/50 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4 flex-none">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl shadow-lg">
            <History className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-purple-300 tracking-wider flex items-center gap-3">
              Historic Championship Archive
              <span className="text-xs px-2.5 py-1 bg-purple-500/30 border border-purple-400/40 rounded-full text-purple-200 normal-case font-semibold">
                {totalFilledEntries} Active Entries Recorded
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Fully editable manual spreadsheet for tracking historic WWE title reigns. Click any cell to edit. All changes sync automatically to Supabase.
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          {savedNotification && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/80 border border-emerald-500 text-emerald-200 rounded-lg text-xs font-bold animate-pulse">
              <Check className="w-4 h-4 text-emerald-400" />
              {savedNotification}
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['All', 'RAW', 'SmackDown', 'NXT', 'Joint'] as const).map(brandTab => (
              <button
                key={brandTab}
                onClick={() => setSelectedBrandFilter(brandTab)}
                className={`px-3 py-1 rounded font-bold transition ${
                  selectedBrandFilter === brandTab
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {brandTab === 'All' ? 'All Brands' : brandTab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMinRows(prev => prev + 10)}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-lg shadow border border-purple-500 flex items-center gap-1.5 transition"
          >
            <Rows className="w-4 h-4" />
            +10 Rows to Spreadsheet
          </button>
        </div>
      </div>

      {/* Summary Board */}
      {renderSummaryBoard()}

      {/* Main Spreadsheet Container */}
      <div className="flex-1 flex items-start gap-8 overflow-x-auto pb-6 rounded-xl relative custom-scrollbar">
        {(selectedBrandFilter === 'All' || selectedBrandFilter === 'RAW') &&
          renderTable(
            'RAW',
            ['WWE/World Heavyweight', 'Intercontinental (3)', 'RAW/World Tag Team (7)', "RAW Women's/Women's World", "Women's Intercontinental"],
            'border-red-900',
            'bg-red-950/40',
            'bg-red-700'
          )}

        {(selectedBrandFilter === 'All' || selectedBrandFilter === 'SmackDown') &&
          renderTable(
            'SmackDown',
            ['Universal/Undisputed WWE Championship', 'United States (3)', 'SD/WWE Tag Team (7)', "SD/WWE Women's", "Women's US"],
            'border-blue-900',
            'bg-blue-950/40',
            'bg-blue-700'
          )}

        {(selectedBrandFilter === 'All' || selectedBrandFilter === 'NXT') &&
          renderTable(
            'NXT',
            ['NXT (5)', 'North American (3)', 'Tag Team (7)', "NXT Women's", "Women's NXT NA"],
            'border-yellow-900',
            'bg-yellow-900/30',
            'bg-yellow-600'
          )}

        {(selectedBrandFilter === 'All' || selectedBrandFilter === 'Joint') &&
          renderTable(
            'Joint',
            ["Women's Tag Team"],
            'border-emerald-900',
            'bg-emerald-950/40',
            'bg-emerald-700'
          )}
      </div>
    </div>
  );
};
