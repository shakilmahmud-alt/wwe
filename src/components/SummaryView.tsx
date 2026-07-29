import React, { useState } from 'react';
import { AppState } from '../types';
import { PieChart, Users, Crown, Swords, Calendar, Download, Upload, RotateCcw, Flame, Zap, Tv, Award, Trophy, Clock, Trash2 } from 'lucide-react';
import { getDisplayAcquiredDate } from '../utils/universeTime';
import { CalendarView } from './CalendarView';

interface SummaryViewProps {
  appState: AppState;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateMatrix?: (key: 'historyMatrix' | 'emptyMatrix', newMatrix: any[]) => void;
  onUpdateMatrixColumns?: (newColumns: any[]) => void;
  onUpdateTime?: (newTime: any) => void;
  onAddCalendarEvent: (event: any) => void;
  onUpdateCalendarEvent: (event: any) => void;
  onToggleCalendarComplete: (id: string) => void;
  onDeleteCalendarEvent: (id: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  appState,
  onLoadSampleData,
  onClearAllData,
  onExportJSON,
  onImportJSON,
  onAddCalendarEvent,
  onUpdateCalendarEvent,
  onToggleCalendarComplete,
  onDeleteCalendarEvent,
  onUpdateMatrix,
  onUpdateMatrixColumns
}) => {
  const { superstars, womenTagTeams, champions, rivalries, calendarEvents } = appState;
  const [matrixBrand, setMatrixBrand] = useState<'All' | 'RAW' | 'SmackDown' | 'NXT'>('All');

  const [showAddColModal, setShowAddColModal] = useState(false);
  const [newColBrand, setNewColBrand] = useState<'RAW'|'SmackDown'|'NXT'|'Joint'>('RAW');
  const [newColTitle, setNewColTitle] = useState('');

  const handleAddRow = (matrixKey: 'historyMatrix' | 'emptyMatrix') => {
    if (!onUpdateMatrix || !appState[matrixKey]) return;
    const newMatrix = [...appState[matrixKey]!];
    newMatrix.push({
      id: 'row-' + Date.now(),
      month: 'New Month',
      mainPle: '',
      nxtMonth: '',
      nxtPle: '',
      champions: {}
    } as any);
    onUpdateMatrix(matrixKey, newMatrix);
  };

  const handleDeleteRow = (matrixKey: 'historyMatrix' | 'emptyMatrix', rowIndex: number) => {
    if (!onUpdateMatrix || !appState[matrixKey]) return;
    const newMatrix = [...appState[matrixKey]!];
    newMatrix.splice(rowIndex, 1);
    onUpdateMatrix(matrixKey, newMatrix);
  };

  const handleAddColumn = () => {
    if (!onUpdateMatrixColumns || !appState.matrixColumns) return;
    if (!newColTitle.trim()) return;
    const newColumns = [...appState.matrixColumns, {
      id: 'c-custom-' + Date.now(),
      brand: newColBrand,
      titleName: newColTitle.trim()
    }];
    onUpdateMatrixColumns(newColumns);
    setShowAddColModal(false);
    setNewColTitle('');
  };

  const handleDeleteColumn = (colId: string) => {
    if (!onUpdateMatrixColumns || !appState.matrixColumns) return;
    if (window.confirm('Are you sure you want to delete this column? This will remove data for it from both matrices.')) {
      onUpdateMatrixColumns(appState.matrixColumns.filter(c => c.id !== colId));
    }
  };


  const handleCellChange = (matrixKey: 'historyMatrix' | 'emptyMatrix', rowIndex: number, fieldPath: string, newValue: string) => {
    if (!onUpdateMatrix || !appState[matrixKey]) return;
    const newMatrix = [...appState[matrixKey]!];
    const row = JSON.parse(JSON.stringify(newMatrix[rowIndex]));
    
    const parts = fieldPath.split('.');
    if (parts.length === 2) {
      row[parts[0]][parts[1]] = newValue;
    } else {
      row[fieldPath] = newValue;
    }
    
    newMatrix[rowIndex] = row;
    onUpdateMatrix(matrixKey, newMatrix);
  };

  const orderedChampions = [...champions].sort((a, b) => {
    const order: Record<string, number> = { 'RAW': 1, 'SmackDown': 2, 'NXT': 3, 'Joint': 4 };
    return (order[a.brand] || 99) - (order[b.brand] || 99);
  });

  const currentUniverseTime = appState.universeTime || { year: 2, month: 'May', week: 'Day 14 (PLE / W3 - 14d)' };

  const displayMatrix1 = appState.historyMatrix && appState.historyMatrix.length > 0 
    ? appState.historyMatrix 
    : [];

  const displayMatrix2 = appState.emptyMatrix && appState.emptyMatrix.length > 0
    ? appState.emptyMatrix
    : [];

  const matrices = [
    {
      key: 'historyMatrix' as const,
      title: 'Year 1 Month-by-Month Title History Spreadsheet',
      description: 'Complete chronological breakdown of title holders across May to April (WrestleMania), reflecting all title changes.',
      data: displayMatrix1
    },
    {
      key: 'emptyMatrix' as const,
      title: 'Year 2 Month-by-Month Title History Spreadsheet',
      description: 'Blank slate for your second year of Universe Mode. Track title changes and PPVs.',
      data: displayMatrix2
    }
  ];

  const rawCount = superstars.filter((s) => s.brand === 'RAW' && s.tier !== 'Tag Team').length;
  const sdCount = superstars.filter((s) => s.brand === 'SmackDown' && s.tier !== 'Tag Team').length;
  const nxtCount = superstars.filter((s) => s.brand === 'NXT' && s.tier !== 'Tag Team').length;
  const totalRoster = superstars.filter((s) => s.tier !== 'Tag Team').length;

  const femaleCount = superstars.filter((s) => s.tier === 'Female').length;
  const maleCount = totalRoster - femaleCount;

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl shadow-lg">
            <PieChart className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-cyan-300 tracking-wider">
              WWE 2K26 Universe Analytics & Summary
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              High level distribution of your Universe roster, brand split, active titles, and database management.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onLoadSampleData}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
          >
            Load Screenshot Dataset
          </button>
          <button
            onClick={onClearAllData}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 transition"
          >
            Clear Database
          </button>
          <button
            onClick={onExportJSON}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Total Superstars</span>
            <span className="text-3xl font-black text-white">{totalRoster}</span>
          </div>
          <Users className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Active Champions</span>
            <span className="text-3xl font-black text-amber-400">{champions.length}</span>
          </div>
          <Crown className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Active Feuds</span>
            <span className="text-3xl font-black text-orange-400">{rivalries.length}</span>
          </div>
          <Swords className="w-8 h-8 text-orange-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Scheduled Events</span>
            <span className="text-3xl font-black text-purple-400">{calendarEvents.length}</span>
          </div>
          <Calendar className="w-8 h-8 text-purple-400 opacity-60" />
        </div>
      </div>

      {/* Brand Breakdown Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Brand Distribution</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-red-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> RAW
                </span>
                <span>{rawCount} Superstars ({totalRoster ? Math.round((rawCount / totalRoster) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-red-600 h-full transition-all duration-500"
                  style={{ width: `${totalRoster ? (rawCount / totalRoster) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> SmackDown
                </span>
                <span>{sdCount} Superstars ({totalRoster ? Math.round((sdCount / totalRoster) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${totalRoster ? (sdCount / totalRoster) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-yellow-400 flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5" /> NXT
                </span>
                <span>{nxtCount} Superstars ({totalRoster ? Math.round((nxtCount / totalRoster) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-yellow-500 h-full transition-all duration-500"
                  style={{ width: `${totalRoster ? (nxtCount / totalRoster) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Gender & Division Split</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-400">Men's Division</span>
                <span>{maleCount} Superstars ({totalRoster ? Math.round((maleCount / totalRoster) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-500 h-full transition-all duration-500"
                  style={{ width: `${totalRoster ? (maleCount / totalRoster) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-pink-400">Women's Division</span>
                <span>{femaleCount} Superstars ({totalRoster ? Math.round((femaleCount / totalRoster) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-pink-500 h-full transition-all duration-500"
                  style={{ width: `${totalRoster ? (femaleCount / totalRoster) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-400">Women's Tag Teams</span>
                <span>{womenTagTeams.length} Teams</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-purple-500 h-full transition-all duration-500"
                  style={{ width: `${womenTagTeams.length ? 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CalendarView
        events={appState.calendarEvents}
        onAddEvent={onAddCalendarEvent}
        onUpdateEvent={onUpdateCalendarEvent}
        onToggleComplete={onToggleCalendarComplete}
        onDeleteEvent={onDeleteCalendarEvent}
      />

      {/* Active Champions Duration Tracker (Auto-Calculated) */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black uppercase text-amber-400 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Current Universe Champions & Duration Tracker
            </h2>
            <p className="text-xs text-slate-400">
              Auto-calculated reign duration from acquisition date up to current game time: <span className="text-amber-300 font-bold">Year {currentUniverseTime.year} • {currentUniverseTime.month} ({currentUniverseTime.week.split(' ')[0]} {currentUniverseTime.week.split(' ')[1]})</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {currentUniverseTime.year > 1 ? `${currentUniverseTime.year - 1} Year Complete • ` : ''}Yr {currentUniverseTime.year} Active
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {orderedChampions.map((c) => (
            <div key={c.id} className={`p-3.5 rounded-xl border transition shadow-lg flex flex-col justify-between ${c.brand === 'RAW' ? 'bg-red-950/40 border-red-500/50 hover:border-red-400 hover:bg-red-950/60' : c.brand === 'SmackDown' ? 'bg-blue-950/40 border-blue-500/50 hover:border-blue-400 hover:bg-blue-950/60' : c.brand === 'NXT' ? 'bg-yellow-950/40 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-950/60' : 'bg-pink-950/40 border-pink-500/50 hover:border-pink-400 hover:bg-pink-950/60'}`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    c.brand === 'RAW' ? 'bg-red-950 text-red-300 border border-red-800' :
                    c.brand === 'SmackDown' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    c.brand === 'NXT' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                    'bg-pink-950 text-pink-300 border border-pink-800'
                  }`}>
                    {c.brand}
                  </span>
                  {c.acquiredDate && (
                    <span className="text-[10px] text-purple-300 font-medium">Won: {getDisplayAcquiredDate(c.acquiredDate)}</span>
                  )}
                </div>
                <h4 className="text-xs font-extrabold text-slate-300 line-clamp-1">{c.titleName}</h4>
                <div className="text-base font-black text-white mt-0.5">{c.currentChampion}</div>
                {c.previousChampion && (
                  <div className="text-[10px] text-slate-400 mt-0.5">Prev: {c.previousChampion}</div>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-black">
                  <span>{c.daysHeld} Days Reign</span>
                  <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 py-0.2 rounded font-bold uppercase">Auto</span>
                </div>
                <span className="text-slate-400 font-semibold text-[10px]">{c.defenses} Defenses</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      {/* Year 1 and Year 2 Matrices */}
      {matrices.map((matrix) => (
        <div key={matrix.key} className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-black uppercase text-yellow-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                {matrix.title}
              </h2>
              <p className="text-xs text-slate-400">
                {matrix.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              {(['All', 'SmackDown', 'RAW', 'NXT'] as const).map((bTab) => (
                <button
                  key={bTab}
                  onClick={() => setMatrixBrand(bTab)}
                  className={`px-3 py-1 rounded font-bold transition ${
                    matrixBrand === bTab ? 'bg-yellow-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {bTab === 'All' ? 'All Brands' : bTab}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <table className="w-max text-center text-xs border-collapse border-2 border-black min-w-[1200px] text-black bg-white">
              <thead>
                {/* Super Header Row */}
                <tr className="border-b-2 border-black font-extrabold uppercase">
                  {(matrixBrand === 'All' || matrixBrand === 'RAW' || matrixBrand === 'SmackDown') && (
                    <th colSpan={2} className={`p-1 border-r-2 border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}></th>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'RAW') && (
                    <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'RAW').length} className="p-1 border-r-2 border-black bg-[#fca5a5]">RAW</th>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'SmackDown') && (
                    <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'SmackDown').length} className="p-1 border-r-2 border-black bg-[#93c5fd]">SmackDown</th>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'NXT') && (
                    <>
                      <th colSpan={2} className="p-1 border-r-2 border-black bg-[#fde047]"></th>
                      <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'NXT').length} className="p-1 border-r-2 border-black bg-[#fde047]">NXT</th>
                    </>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'Joint') && (
                    <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'Joint').length} className="p-1 border-black bg-white"></th>
                  )}
                  <th className="p-1 border-l-2 border-black bg-slate-900 text-white w-10"></th>
                </tr>
                {/* Sub Header Row */}
                <tr className="border-b-2 border-black font-extrabold whitespace-nowrap">
                  {(matrixBrand === 'All' || matrixBrand === 'RAW' || matrixBrand === 'SmackDown') && (
                    <>
                      <th className={`p-1.5 w-24 border-r border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>Month</th>
                      <th className={`p-1.5 min-w-[120px] border-r-2 border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>PPV</th>
                    </>
                  )}
                  
                  {(appState.matrixColumns || []).filter(c => matrixBrand === 'All' || c.brand === matrixBrand).map(col => {
                    let bgClass = '';
                    if (col.brand === 'RAW') bgClass = 'bg-[#fca5a5]';
                    if (col.brand === 'SmackDown') bgClass = 'bg-[#93c5fd]';
                    if (col.brand === 'NXT') bgClass = 'bg-[#fde047]';
                    if (col.brand === 'Joint') bgClass = 'bg-[#c084fc]';

                    // If it's the first NXT column, we need to inject Month/PPV headers for NXT right before it!
                    const isFirstNxt = (matrixBrand === 'All' || matrixBrand === 'NXT') && col.id === (appState.matrixColumns || []).find(c => c.brand === 'NXT')?.id;

                    return (
                      <React.Fragment key={col.id}>
                        {isFirstNxt && (
                          <>
                            <th className="p-1.5 w-24 border-r border-black bg-[#fde047]">Month</th>
                            <th className="p-1.5 min-w-[120px] border-r-2 border-black bg-[#fde047]">PPV</th>
                          </>
                        )}
                        <th className={`p-1.5 min-w-[120px] border-r border-black relative group ${bgClass}`}>
                          <div className="flex items-center justify-center gap-1">
                            <span>{col.titleName}</span>
                            <button onClick={() => handleDeleteColumn(col.id)} className="hidden group-hover:flex items-center justify-center bg-red-600 hover:bg-red-700 text-white w-4 h-4 rounded-full text-[10px] absolute right-1" title="Delete Column">✕</button>
                          </div>
                        </th>
                      </React.Fragment>
                    );
                  })}
                  <th className="p-1 border-l-2 border-black bg-slate-900 text-center">
                    <button onClick={() => setShowAddColModal(true)} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition" title="Add Column">+</button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-semibold text-black">
                {matrix.data.map((row, idx) => {
                  const isWM = row.mainPle === 'WrestleMania';
                  return (
                    <tr key={row.id || `${row.month}-${idx}`} className={`transition ${isWM ? 'border-b-4 border-black' : ''}`}>
                      {(matrixBrand === 'All' || matrixBrand === 'RAW' || matrixBrand === 'SmackDown') && (
                        <>
                          <td className={`border-r border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>
                            <input value={row.month} onChange={(e) => handleCellChange(matrix.key, idx, 'month', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-white/30" />
                          </td>
                          <td className={`border-r-2 border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>
                            <input value={row.mainPle || ''} onChange={(e) => handleCellChange(matrix.key, idx, 'mainPle', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-white/30" />
                          </td>
                        </>
                      )}
                      
                      {(appState.matrixColumns || []).filter(c => matrixBrand === 'All' || c.brand === matrixBrand).map(col => {
                        let bgClass = '';
                        if (col.brand === 'RAW') bgClass = 'bg-[#fca5a5]';
                        if (col.brand === 'SmackDown') bgClass = 'bg-[#93c5fd]';
                        if (col.brand === 'NXT') bgClass = 'bg-[#fde047]';
                        if (col.brand === 'Joint') bgClass = 'bg-[#c084fc]';

                        const isFirstNxt = (matrixBrand === 'All' || matrixBrand === 'NXT') && col.id === (appState.matrixColumns || []).find(c => c.brand === 'NXT')?.id;

                        return (
                          <React.Fragment key={col.id}>
                            {isFirstNxt && (
                              <>
                                <td className="border-r border-black bg-[#fde047]">
                                  <input value={row.nxtMonth || ''} onChange={(e) => handleCellChange(matrix.key, idx, 'nxtMonth', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-black/10" />
                                </td>
                                <td className="border-r-2 border-black bg-[#fde047]">
                                  <input value={row.nxtPle || ''} onChange={(e) => handleCellChange(matrix.key, idx, 'nxtPle', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-black/10" />
                                </td>
                              </>
                            )}
                            <td className={`border-r border-black ${bgClass}`}>
                              <input 
                                value={row.champions?.[col.id] || ''} 
                                onChange={(e) => handleCellChange(matrix.key, idx, `champions.${col.id}`, e.target.value)} 
                                className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-white/40"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="p-1 border-l-2 border-black bg-slate-900 text-center">
                        <button onClick={() => handleDeleteRow(matrix.key, idx)} className="text-red-400 hover:text-red-300 p-1" title="Delete Row"><Trash2 className="w-4 h-4 mx-auto" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={() => handleAddRow(matrix.key)} className="text-xs text-slate-400 border border-slate-800 hover:text-yellow-400 hover:border-yellow-400/50 px-3 py-1.5 rounded font-bold transition w-max block">+ Add Row</button>
        </div>
      ))}

    </div>
  );
};
