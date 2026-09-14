import React, { useState, useMemo } from 'react';
import { ArchiveEntry, ArchiveColumn } from '../types';
import { defaultArchiveColumns } from '../data/sampleRoster';
import {
  History,
  Trophy,
  Plus,
  Trash2,
  Filter,
  Rows,
  Check,
  Edit2,
  Columns,
  X,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface ChampListViewProps {
  archive: ArchiveEntry[];
  archiveColumns?: ArchiveColumn[];
  onUpdateArchiveEntry: (entry: ArchiveEntry) => void;
  onDeleteArchiveEntry?: (id: string) => void;
  onAddArchiveColumn?: (brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint', titleName: string) => void;
  onRenameArchiveColumn?: (brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint', oldTitle: string, newTitle: string) => void;
  onDeleteArchiveColumn?: (brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint', titleName: string) => void;
}

export const ChampListView: React.FC<ChampListViewProps> = ({
  archive,
  archiveColumns = defaultArchiveColumns,
  onUpdateArchiveEntry,
  onDeleteArchiveEntry,
  onAddArchiveColumn,
  onRenameArchiveColumn,
  onDeleteArchiveColumn
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<'All' | 'RAW' | 'SmackDown' | 'NXT' | 'Joint'>('All');
  const [extraRows, setExtraRows] = useState<Record<string, number>>({});
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const addBrandRows = (brand: string, count: number = 1) => {
    setExtraRows(prev => ({
      ...prev,
      [brand]: (prev[brand] || 0) + count
    }));
  };

  const addGlobalRows = (count: number = 10) => {
    setExtraRows(prev => {
      const updated = { ...prev };
      (['RAW', 'SmackDown', 'NXT', 'Joint'] as const).forEach(b => {
        updated[b] = (updated[b] || 0) + count;
      });
      return updated;
    });
  };

  // Add Column Modal State
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [addColumnBrand, setAddColumnBrand] = useState<'RAW' | 'SmackDown' | 'NXT' | 'Joint'>('RAW');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addColumnError, setAddColumnError] = useState<string | null>(null);

  // Rename Column Modal State
  const [renameModalData, setRenameModalData] = useState<{
    brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint';
    oldTitle: string;
    newTitle: string;
  } | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);

  // Delete Column Modal State
  const [deleteModalData, setDeleteModalData] = useState<{
    brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint';
    titleName: string;
    entryCount: number;
  } | null>(null);

  // Resolve titles for a given brand
  const getBrandTitles = (brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint'): string[] => {
    const fromCols = (archiveColumns && archiveColumns.length > 0 ? archiveColumns : defaultArchiveColumns)
      .filter(c => c.brand === brand)
      .map(c => c.titleName);

    // Also include any titles already present in archive for this brand (zero data loss)
    const fromArchive = Array.from(
      new Set(archive.filter(a => a.brand === brand).map(a => a.titleName))
    );

    // Merge maintaining order, avoiding duplicates
    const combined = [...fromCols];
    for (const title of fromArchive) {
      if (!combined.includes(title)) {
        combined.push(title);
      }
    }

    return combined.length > 0 ? combined : (
      defaultArchiveColumns.filter(c => c.brand === brand).map(c => c.titleName)
    );
  };

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

  const triggerSavedToast = (msg = 'Changes auto-saved to Database!') => {
    setSavedNotification(msg);
    setTimeout(() => {
      setSavedNotification(null);
    }, 2500);
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

  // Open Add Column Modal
  const openAddColumnModal = (brand?: 'RAW' | 'SmackDown' | 'NXT' | 'Joint') => {
    const initialBrand = brand || (selectedBrandFilter !== 'All' ? selectedBrandFilter : 'RAW');
    setAddColumnBrand(initialBrand);
    setNewColumnTitle('');
    setAddColumnError(null);
    setIsAddColumnModalOpen(true);
  };

  const handleConfirmAddColumn = () => {
    const trimmed = newColumnTitle.trim();
    if (!trimmed) {
      setAddColumnError('Please enter a Championship Title name.');
      return;
    }

    const currentTitles = getBrandTitles(addColumnBrand);
    if (currentTitles.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setAddColumnError(`A title column named "${trimmed}" already exists for ${addColumnBrand}.`);
      return;
    }

    if (onAddArchiveColumn) {
      onAddArchiveColumn(addColumnBrand, trimmed);
    }
    setIsAddColumnModalOpen(false);
    triggerSavedToast(`Title column "${trimmed}" added to ${addColumnBrand}!`);
  };

  // Open Rename Column Modal
  const openRenameModal = (brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint', oldTitle: string) => {
    setRenameModalData({ brand, oldTitle, newTitle: oldTitle });
    setRenameError(null);
  };

  const handleConfirmRenameColumn = () => {
    if (!renameModalData) return;
    const { brand, oldTitle, newTitle } = renameModalData;
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setRenameError('Title name cannot be empty.');
      return;
    }
    if (trimmed !== oldTitle) {
      const currentTitles = getBrandTitles(brand);
      if (currentTitles.some(t => t.toLowerCase() === trimmed.toLowerCase() && t.toLowerCase() !== oldTitle.toLowerCase())) {
        setRenameError(`A column named "${trimmed}" already exists for ${brand}.`);
        return;
      }
      if (onRenameArchiveColumn) {
        onRenameArchiveColumn(brand, oldTitle, trimmed);
      }
      triggerSavedToast(`Championship renamed to "${trimmed}"!`);
    }
    setRenameModalData(null);
  };

  // Open Delete Column Modal
  const openDeleteModal = (brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint', titleName: string) => {
    const entryCount = archive.filter(a => a.brand === brand && a.titleName === titleName && a.who?.trim()).length;
    setDeleteModalData({ brand, titleName, entryCount });
  };

  const handleConfirmDeleteColumn = () => {
    if (!deleteModalData) return;
    const { brand, titleName } = deleteModalData;
    if (onDeleteArchiveColumn) {
      onDeleteArchiveColumn(brand, titleName);
    }
    triggerSavedToast(`Column "${titleName}" removed from ${brand}.`);
    setDeleteModalData(null);
  };

  const renderTable = (
    brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint',
    themeColor: string,
    bgColorClass: string,
    headerBgClass: string
  ) => {
    const titles = getBrandTitles(brand);

    // Group entries by title
    const grouped = titles.reduce((acc, title) => {
      acc[title] = archive
        .filter(a => a.brand === brand && a.titleName === title)
        .sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<string, ArchiveEntry[]>);

    // Find the maximum row index across all titles in this brand where text/data is present
    const maxFilledOrder = titles.reduce((max, title) => {
      const entries = grouped[title] || [];
      const filled = entries.filter(a =>
        (a.who && a.who.trim() !== '') ||
        (a.times !== undefined && a.times !== null && String(a.times).trim() !== '') ||
        (a.reign !== undefined && a.reign !== null && String(a.reign).trim() !== '') ||
        (a.month !== undefined && a.month !== null && String(a.month).trim() !== '')
      );
      const highest = filled.reduce((m, a) => Math.max(m, a.order), 0);
      return Math.max(max, highest);
    }, 0);

    // Total rows to render: exact filled rows, plus any manually added extra rows. If brand is empty, show at least 1 row.
    const brandExtra = extraRows[brand] || 0;
    const currentMax = Math.max(maxFilledOrder + brandExtra, maxFilledOrder > 0 ? maxFilledOrder : 1);

    const maxStats = titles.reduce((acc, title) => {
      acc[title] = {
        times: Math.max(...grouped[title]?.map(a => Number(a.times) || 0) || [0], 1),
        reign: Math.max(...grouped[title]?.map(a => Number(a.reign) || 0) || [0], 1),
        month: Math.max(...grouped[title]?.map(a => Number(a.month) || 0) || [0], 1)
      };
      return acc;
    }, {} as Record<string, { times: number; reign: number; month: number }>);

    return (
      <div className={`border ${themeColor} shadow-2xl flex-none min-w-max bg-slate-950/80 rounded-xl overflow-hidden mb-6`}>
        {/* Table Title Bar with Add Column & Add Row Actions */}
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
              onClick={() => openAddColumnModal(brand)}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-bold flex items-center gap-1.5 border border-white/30 transition shadow backdrop-blur-sm"
              title={`Add a new Championship Title column to ${brand}`}
            >
              <Columns className="w-3.5 h-3.5" /> ➕ Add Title Column
            </button>

            <button
              onClick={() => addBrandRows(brand, 1)}
              className="px-2.5 py-1 bg-black/40 hover:bg-black/60 text-white rounded text-xs font-bold flex items-center gap-1 border border-white/20 transition shadow"
              title={`Add 1 row to ${brand} spreadsheet`}
            >
              <Plus className="w-3.5 h-3.5" /> +1 Row
            </button>

            <button
              onClick={() => addBrandRows(brand, 10)}
              className="px-2.5 py-1 bg-black/40 hover:bg-black/60 text-white rounded text-xs font-bold flex items-center gap-1 border border-white/20 transition shadow"
              title={`Add 10 rows to ${brand} spreadsheet`}
            >
              <Plus className="w-3.5 h-3.5" /> +10 Rows
            </button>
          </div>
        </div>

        <div className="w-full">
          <table className={`w-full text-center text-xs ${bgColorClass} whitespace-nowrap border-collapse`}>
            <thead>
              {/* Row 1: Championship Names (Super Header) with Edit / Delete actions */}
              <tr className="sticky top-0 z-30 shadow-md">
                {titles.map(title => (
                  <th
                    key={title}
                    colSpan={4}
                    className={`p-2.5 border-b-2 border-r-4 border-slate-900 font-black tracking-wider uppercase text-white ${headerBgClass} text-center shadow-inner group relative`}
                  >
                    <div className="flex items-center justify-center gap-2 relative">
                      <span className="truncate max-w-[200px]" title={title}>{title}</span>
                      
                      {/* Column Header Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-white/20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenameModal(brand, title);
                          }}
                          className="text-slate-300 hover:text-yellow-300 transition p-0.5"
                          title={`Rename "${title}"`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(brand, title);
                          }}
                          className="text-slate-300 hover:text-red-400 transition p-0.5"
                          title={`Delete "${title}" Column`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
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
                      const entry = grouped[title]?.find(a => a.order === order);
                      const tVal = Number(entry?.times) || 0;
                      const rVal = Number(entry?.reign) || 0;
                      const mVal = Number(entry?.month) || 0;

                      const tPct = Math.min(100, (tVal / (maxStats[title]?.times || 1)) * 100);
                      const rPct = Math.min(100, (rVal / (maxStats[title]?.reign || 1)) * 100);
                      const mPct = Math.min(100, (mVal / (maxStats[title]?.month || 1)) * 100);

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
    // Collect all active titles across all brands
    const brands: ('RAW' | 'SmackDown' | 'NXT' | 'Joint')[] = ['RAW', 'SmackDown', 'NXT', 'Joint'];
    const brandThemes: Record<string, string> = {
      RAW: 'from-red-950 to-red-900/40 border-red-500/50',
      SmackDown: 'from-blue-950 to-blue-900/40 border-blue-500/50',
      NXT: 'from-yellow-950 to-yellow-900/40 border-yellow-500/50',
      Joint: 'from-emerald-950 to-emerald-900/40 border-emerald-500/50'
    };

    const allBelts: { brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint'; title: string; theme: string }[] = [];

    brands.forEach(brand => {
      const titles = getBrandTitles(brand);
      titles.forEach(title => {
        allBelts.push({
          brand,
          title,
          theme: brandThemes[brand] || 'from-purple-950 to-purple-900/40 border-purple-500/50'
        });
      });
    });

    return (
      <div className="flex-none w-full bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black uppercase text-slate-200 tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Championship Records Summary Board ({allBelts.length} Championships)
          </h2>
          <button
            onClick={() => openAddColumnModal()}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Title Column
          </button>
        </div>
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
                key={`${belt.brand}-${belt.title}-${idx}`}
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
              Fully customizable spreadsheet. Add rows or title columns dynamically for any brand. All changes sync automatically to Supabase.
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center flex-wrap gap-3">
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
            onClick={() => openAddColumnModal()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow border border-indigo-400 flex items-center gap-1.5 transition"
            title="Add a new Championship Title column"
          >
            <Columns className="w-4 h-4" />
            ➕ Add Title Column
          </button>

          <button
            onClick={() => addGlobalRows(10)}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-lg shadow border border-purple-500 flex items-center gap-1.5 transition"
            title="Add 10 more rows to all spreadsheets"
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
            'border-red-900',
            'bg-red-950/40',
            'bg-red-700'
          )}

        {(selectedBrandFilter === 'All' || selectedBrandFilter === 'SmackDown') &&
          renderTable(
            'SmackDown',
            'border-blue-900',
            'bg-blue-950/40',
            'bg-blue-700'
          )}

        {(selectedBrandFilter === 'All' || selectedBrandFilter === 'NXT') &&
          renderTable(
            'NXT',
            'border-yellow-900',
            'bg-yellow-900/30',
            'bg-yellow-600'
          )}

        {(selectedBrandFilter === 'All' || selectedBrandFilter === 'Joint') &&
          renderTable(
            'Joint',
            'border-emerald-900',
            'bg-emerald-950/40',
            'bg-emerald-700'
          )}
      </div>

      {/* ================= ADD COLUMN MODAL ================= */}
      {isAddColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-black text-lg">
                <Columns className="w-5 h-5 text-purple-400" />
                Add Championship Column
              </div>
              <button
                onClick={() => setIsAddColumnModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Brand
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['RAW', 'SmackDown', 'NXT', 'Joint'] as const).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setAddColumnBrand(b);
                        setAddColumnError(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        addColumnBrand === b
                          ? b === 'RAW'
                            ? 'bg-red-600 border-red-400 text-white shadow-lg'
                            : b === 'SmackDown'
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                            : b === 'NXT'
                            ? 'bg-yellow-600 border-yellow-400 text-white shadow-lg'
                            : 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Championship Title Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. WWE Speed Championship, Hardcore Title..."
                  value={newColumnTitle}
                  onChange={e => {
                    setNewColumnTitle(e.target.value);
                    setAddColumnError(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleConfirmAddColumn();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm font-semibold"
                />
              </div>

              {/* Quick Template suggestions */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Suggested Titles:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Speed Championship', 'Hardcore Championship', 'European Championship', 'Cruiserweight Championship', 'Million Dollar Title'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setNewColumnTitle(sug);
                        setAddColumnError(null);
                      }}
                      className="px-2 py-1 bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500 text-[11px] text-slate-300 hover:text-white rounded-md transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {addColumnError && (
                <div className="p-2.5 bg-red-950/80 border border-red-500 rounded-lg text-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  {addColumnError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddColumnModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddColumn}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RENAME COLUMN MODAL ================= */}
      {renameModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-yellow-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-yellow-300 font-black text-lg">
                <Edit2 className="w-5 h-5 text-yellow-400" />
                Rename Championship Column
              </div>
              <button
                onClick={() => setRenameModalData(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Brand: <span className="font-bold text-white uppercase">{renameModalData.brand}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Title Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={renameModalData.newTitle}
                  onChange={e => {
                    setRenameModalData({ ...renameModalData, newTitle: e.target.value });
                    setRenameError(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleConfirmRenameColumn();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-sm font-semibold"
                />
              </div>

              {renameError && (
                <div className="p-2.5 bg-red-950/80 border border-red-500 rounded-lg text-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  {renameError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRenameModalData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRenameColumn}
                className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE COLUMN MODAL ================= */}
      {deleteModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-400 font-black text-lg">
                <Trash2 className="w-5 h-5 text-red-400" />
                Delete Title Column
              </div>
              <button
                onClick={() => setDeleteModalData(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-200">
                Are you sure you want to delete the <span className="font-extrabold text-white">"{deleteModalData.titleName}"</span> column from <span className="font-bold text-red-400">{deleteModalData.brand}</span>?
              </p>

              {deleteModalData.entryCount > 0 && (
                <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    Warning: Contains {deleteModalData.entryCount} Saved Record(s)
                  </div>
                  <p className="text-slate-300">
                    Deleting this column will also remove all {deleteModalData.entryCount} recorded title reigns under this championship.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteColumn}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

