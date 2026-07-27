import React, { useState } from 'react';
import { AchievementMale, BrandType, Superstar } from '../types';
import { Trophy, Plus, Trash2, Search, Award, Star, Flame, Check, ShieldAlert, Filter, ArrowUpDown } from 'lucide-react';

interface AchievementsMenProps {
  achievements: AchievementMale[];
  superstars: Superstar[];
  onAddAchievement: (entry: AchievementMale) => void;
  onUpdateAchievement: (entry: AchievementMale) => void;
  onDeleteAchievement: (id: string) => void;
}

type FilterMode = 'ALL' | 'GRAND_SLAM' | 'CLOSE_GS' | 'HAS_TITLE';
type SortMode = 'NAME' | 'TOTAL' | 'GRAND_SLAM_ORDER';

export const AchievementsMen: React.FC<AchievementsMenProps> = ({
  achievements,
  superstars,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('NAME');
  const [showAddForm, setShowAddForm] = useState(false);

  // New record form state
  const [newSuperstarName, setNewSuperstarName] = useState('');
  const [newGrandSlamOrder, setNewGrandSlamOrder] = useState<number | ''>('');

  const computeGrandSlamScore = (a: AchievementMale): number => {
    let score = 0;
    if (a.univUndisputed) score++;
    if (a.worldHw) score++;
    if (a.ic) score++;
    if (a.us) score++;
    if (a.tagTeam) score++;
    return score;
  };

  const computeTotalScore = (a: AchievementMale): number => {
    let total = 0;
    if (a.univUndisputed) total++;
    if (a.worldHw) total++;
    if (a.ic) total++;
    if (a.us) total++;
    if (a.tagTeam) total++;
    if (a.cruiserweight) total++;
    if (a.nxt) total++;
    if (a.uk) total++;
    if (a.northAmerican) total++;
    return total;
  };

  const isGrandSlamChampion = (a: AchievementMale): boolean => {
    return computeGrandSlamScore(a) === 5 || (a.grandSlamOrder !== undefined && a.grandSlamOrder > 0);
  };

  const handleToggleTitle = (a: AchievementMale, field: keyof AchievementMale) => {
    const currentValue = Boolean(a[field]);
    const updated = {
      ...a,
      [field]: !currentValue
    };
    onUpdateAchievement(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuperstarName.trim()) return;

    const newRecord: AchievementMale = {
      id: `am-${Date.now()}`,
      superstarName: newSuperstarName.trim(),
      grandSlamOrder: typeof newGrandSlamOrder === 'number' ? newGrandSlamOrder : undefined
    };

    onAddAchievement(newRecord);
    setNewSuperstarName('');
    setNewGrandSlamOrder('');
    setShowAddForm(false);
  };

  const filteredList = achievements.filter((a) => {
    const matchesSearch = a.superstarName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const gsScore = computeGrandSlamScore(a);
    const totalScore = computeTotalScore(a);

    if (filterMode === 'GRAND_SLAM') return gsScore === 5 || (a.grandSlamOrder !== undefined && a.grandSlamOrder > 0);
    if (filterMode === 'CLOSE_GS') return gsScore === 4;
    if (filterMode === 'HAS_TITLE') return totalScore > 0;
    return true;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortMode === 'TOTAL') {
      const diff = computeTotalScore(b) - computeTotalScore(a);
      if (diff !== 0) return diff;
    }
    if (sortMode === 'GRAND_SLAM_ORDER') {
      const orderA = a.grandSlamOrder || 999;
      const orderB = b.grandSlamOrder || 999;
      if (orderA !== orderB) return orderA - orderB;
    }
    return a.superstarName.localeCompare(b.superstarName);
  });

  const totalGrandSlamCount = achievements.filter(isGrandSlamChampion).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full uppercase tracking-wider">
                  WWE 2K25 & 2K26 Hall of Records
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {totalGrandSlamCount} Historic Grand Slam Champions
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                Men's Division Championship Tracker <span className="text-amber-400 font-normal text-lg">(Spreadsheet View)</span>
              </h1>
              <p className="text-sm text-slate-300 mt-0.5">
                Grand Slam Champion requires all 5 core titles: Universal/Undisputed, World HW, IC, US, and Tag Team. Click any cell to toggle titles!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> {showAddForm ? 'Close Form' : 'Add Superstar'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Superstar Collapsible Form */}
      {showAddForm && (
        <div className="p-5 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-xl animate-fadeIn space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" /> Log New Superstar to Achievement Spreadsheet
          </h3>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4 text-xs">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-slate-400 mb-1">Superstar Name</label>
              <input
                type="text"
                placeholder="e.g. Triple H, The Rock..."
                value={newSuperstarName}
                onChange={(e) => setNewSuperstarName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="w-48">
              <label className="block text-slate-400 mb-1">Grand Slam Order # (Optional)</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 6, 8..."
                value={newGrandSlamOrder}
                onChange={(e) => setNewGrandSlamOrder(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg transition shadow-md"
            >
              Add to Spreadsheet
            </button>
          </form>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search superstar (e.g. Seth, Batista)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> Filter:
          </span>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'ALL'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setFilterMode('GRAND_SLAM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'GRAND_SLAM'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black border border-red-400'
                : 'bg-slate-950/80 text-red-400 hover:text-white border border-slate-800'
            }`}
          >
            🏆 Grand Slam Champions ({totalGrandSlamCount})
          </button>
          <button
            onClick={() => setFilterMode('CLOSE_GS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'CLOSE_GS'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/80 text-amber-400 hover:text-white border border-slate-800'
            }`}
          >
            ⚡ Close (4/5 Titles)
          </button>
          <button
            onClick={() => setFilterMode('HAS_TITLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'HAS_TITLE'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'bg-slate-950/80 text-blue-400 hover:text-white border border-slate-800'
            }`}
          >
            At Least 1 Title
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" /> Sort:
          </span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="NAME">Name (A-Z)</option>
            <option value="TOTAL">Total Titles (High-Low)</option>
            <option value="GRAND_SLAM_ORDER">Grand Slam Rank #</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto max-h-[750px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse min-w-[1400px]">
            {/* Table Headers */}
            <thead className="sticky top-0 z-30 font-bold uppercase tracking-wider text-center shadow-lg">
              {/* Top Tier Header */}
              <tr className="border-b border-slate-800 text-white text-[11px]">
                <th rowSpan={2} className="py-3 px-3 bg-slate-900 text-left text-slate-200 border-r border-slate-800 w-48 sticky left-0 z-40 shadow-r font-black">
                  Superstar Name
                </th>
                <th colSpan={5} className="py-2 px-2 bg-gradient-to-r from-amber-900/90 via-yellow-950 to-amber-900/90 text-amber-300 border-r border-amber-600/50 font-black tracking-widest text-xs shadow-inner">
                  🏆 CORE GRAND SLAM TITLES (5 BELTS)
                </th>
                <th colSpan={4} className="py-2 px-2 bg-gradient-to-r from-blue-900/90 via-slate-900 to-blue-900/90 text-blue-200 border-r border-blue-700/50 font-black tracking-widest text-xs">
                  ⚡ ADDITIONAL TITLES
                </th>
                <th rowSpan={2} className="py-3 px-2 bg-slate-900 text-slate-200 border-r border-slate-800 w-24 text-center font-black">
                  Total (9)
                </th>
                <th rowSpan={2} className="py-3 px-3 bg-gradient-to-b from-amber-950 to-slate-950 text-amber-300 w-52 text-center font-black">
                  Grand Slam Champion (5)
                </th>
                <th rowSpan={2} className="py-3 px-2 bg-slate-900 text-slate-500 w-12 text-center">
                  Del
                </th>
              </tr>

              {/* Belt Sub-Headers */}
              <tr className="border-b-2 border-slate-700 text-[10px] text-center">
                {/* 5 Grand Slam Belts */}
                <th className="py-2 px-1 bg-amber-950/60 text-amber-200 border-r border-slate-800 w-28" title="Universal / Undisputed WWE">
                  Universal / Undisputed
                </th>
                <th className="py-2 px-1 bg-amber-950/60 text-amber-200 border-r border-slate-800 w-28" title="WWE / World Heavyweight">
                  WWE / World HW
                </th>
                <th className="py-2 px-1 bg-amber-950/60 text-amber-200 border-r border-slate-800 w-28" title="Intercontinental Championship">
                  Intercontinental
                </th>
                <th className="py-2 px-1 bg-amber-950/60 text-amber-200 border-r border-slate-800 w-20" title="United States Championship">
                  US
                </th>
                <th className="py-2 px-1 bg-amber-950/60 text-amber-200 border-r border-amber-600/50 w-24" title="Tag Team Championship">
                  Tag Team
                </th>

                {/* 4 Additional Belts */}
                <th className="py-2 px-1 bg-blue-950/60 text-blue-200 border-r border-slate-800 w-24">
                  Cruiserweight
                </th>
                <th className="py-2 px-1 bg-blue-950/60 text-blue-200 border-r border-slate-800 w-20">
                  NXT
                </th>
                <th className="py-2 px-1 bg-blue-950/60 text-blue-200 border-r border-slate-800 w-20">
                  UK
                </th>
                <th className="py-2 px-1 bg-blue-950/60 text-blue-200 border-r border-slate-800 w-28">
                  North American
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/70 text-center font-medium">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    No achievement records found matching your filter "{searchTerm}".
                  </td>
                </tr>
              ) : (
                sortedList.map((a) => {
                  const gsScore = computeGrandSlamScore(a);
                  const totalScore = computeTotalScore(a);
                  const isGS = gsScore === 5 || (a.grandSlamOrder !== undefined && a.grandSlamOrder > 0);

                  const cellBase = 'py-2 px-2 border-r border-slate-800/80 transition-colors cursor-pointer select-none';

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-900 transition-colors duration-150 ${
                        isGS ? 'bg-gradient-to-r from-red-950/30 via-slate-950 to-amber-950/30 font-semibold' : 'bg-slate-950/40'
                      }`}
                    >
                      {/* Name Column */}
                      <td className={`py-2 px-3 border-r border-slate-800 text-left sticky left-0 z-20 ${isGS ? 'bg-slate-950 shadow-md' : 'bg-slate-950/95'}`}>
                        {isGS ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-red-500 font-black text-sm tracking-wide bg-red-950/30 px-2 py-0.5 rounded border border-red-500/40 shadow-sm flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                              {a.superstarName} {a.grandSlamOrder ? `(${a.grandSlamOrder})` : gsScore === 5 ? '(GS)' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-200 font-bold text-sm hover:text-amber-400 transition">
                            {a.superstarName}
                          </span>
                        )}
                      </td>

                      {/* 5 Core Grand Slam Titles (Clickable Checkboxes) */}
                      <td
                        onClick={() => handleToggleTitle(a, 'univUndisputed')}
                        className={`${cellBase} ${a.univUndisputed ? 'bg-amber-950/40 text-amber-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.univUndisputed ? <Check className="w-4 h-4 mx-auto text-amber-400 font-black stroke-[3]" /> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'worldHw')}
                        className={`${cellBase} ${a.worldHw ? 'bg-amber-950/40 text-amber-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.worldHw ? <Check className="w-4 h-4 mx-auto text-amber-400 font-black stroke-[3]" /> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'ic')}
                        className={`${cellBase} ${a.ic ? 'bg-amber-950/40 text-amber-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.ic ? <Check className="w-4 h-4 mx-auto text-amber-400 font-black stroke-[3]" /> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'us')}
                        className={`${cellBase} ${a.us ? 'bg-amber-950/40 text-amber-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.us ? <Check className="w-4 h-4 mx-auto text-amber-400 font-black stroke-[3]" /> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'tagTeam')}
                        className={`${cellBase} border-r border-amber-600/40 ${a.tagTeam ? 'bg-amber-950/40 text-amber-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.tagTeam ? <Check className="w-4 h-4 mx-auto text-amber-400 font-black stroke-[3]" /> : ''}
                      </td>

                      {/* 4 Additional Titles (Clickable Checkboxes) */}
                      <td
                        onClick={() => handleToggleTitle(a, 'cruiserweight')}
                        className={`${cellBase} ${a.cruiserweight ? 'bg-blue-950/40 text-blue-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.cruiserweight ? <Check className="w-4 h-4 mx-auto text-blue-400 font-black stroke-[3]" /> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'nxt')}
                        className={`${cellBase} ${a.nxt ? 'bg-blue-950/40 text-blue-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.nxt ? <Check className="w-4 h-4 mx-auto text-blue-400 font-black stroke-[3]" /> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'uk')}
                        className={`${cellBase} ${a.uk ? 'bg-blue-950/40 text-blue-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.uk ? <Check className="w-4 h-4 mx-auto text-blue-400 font-black stroke-[3]" /> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'northAmerican')}
                        className={`${cellBase} ${a.northAmerican ? 'bg-blue-950/40 text-blue-300 font-bold' : 'hover:bg-slate-800/40 text-slate-700'}`}
                      >
                        {a.northAmerican ? <Check className="w-4 h-4 mx-auto text-blue-400 font-black stroke-[3]" /> : ''}
                      </td>

                      {/* Total (9) Column */}
                      <td className="py-2 px-2 border-r border-slate-800 text-center font-black">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black shadow-inner inline-block min-w-[32px] ${
                          totalScore >= 5
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20'
                            : totalScore >= 3
                            ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                            : totalScore > 0
                            ? 'bg-slate-800 text-slate-200'
                            : 'text-slate-600 bg-slate-900/50'
                        }`}>
                          {totalScore}
                        </span>
                      </td>

                      {/* Grand Slam Champion (5) Progress Bar Column */}
                      <td className="py-2 px-3 border-r border-slate-800 text-center">
                        {gsScore === 5 || isGS ? (
                          <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white font-black py-1 px-3 rounded-lg shadow-md border border-green-400/50 flex items-center justify-center gap-1.5 animate-pulse">
                            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                            <span>5 / 5 (GRAND SLAM)</span>
                          </div>
                        ) : gsScore > 0 ? (
                          <div className="w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
                            <div
                              className={`h-5 rounded-md flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                                gsScore === 4
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 w-4/5 font-black'
                                  : gsScore === 3
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 w-3/5'
                                  : gsScore === 2
                                  ? 'bg-amber-700/80 text-amber-100 w-2/5'
                                  : 'bg-amber-900/60 text-amber-200 w-1/5'
                              }`}
                            >
                              {gsScore}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium text-xs">0</span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => onDeleteAchievement(a.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition rounded hover:bg-slate-800"
                          title="Remove Superstar"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-t border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping inline-block"></span>
            <span className="font-bold text-red-400">Red Highlighted Superstars:</span>
            <span>Indicates historic Grand Slam Champions. Number in parentheses e.g. <strong>Batista (8)</strong> represents the chronological order they achieved Grand Slam!</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 font-semibold">
            <span className="bg-slate-900 px-3 py-1 rounded-md border border-slate-800">Total Superstars: <strong className="text-amber-400">{achievements.length}</strong></span>
            <span className="bg-slate-900 px-3 py-1 rounded-md border border-slate-800">Grand Slam Winners: <strong className="text-green-400">{totalGrandSlamCount}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
