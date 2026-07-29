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

  const isGrandSlamChampion = (a: AchievementMale) => {
    return a.grandSlamOrder !== undefined && a.grandSlamOrder > 0;
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

    if (filterMode === 'GRAND_SLAM') return (a.grandSlamOrder !== undefined && a.grandSlamOrder > 0);
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
    <div className="space-y-4 animate-fadeIn flex flex-col h-[calc(100vh-100px)]">
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
        <div className="p-5 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-xl animate-fadeIn space-y-4 flex-none">
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-sm flex-none">
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
      <div className="relative flex flex-col flex-1 min-h-0 bg-slate-950/90 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
          <table className="w-max text-xs text-left border-collapse min-w-[1400px]">
            <thead className="bg-slate-950 text-slate-300 uppercase text-xs sticky top-0 z-10 shadow-lg shadow-slate-900/50">
              <tr>
                <th rowSpan={2} className="py-3 px-4 border-b-2 border-r border-slate-800 text-left w-[220px] bg-slate-950">
                  Name
                </th>
                <th colSpan={5} className="py-1 border-b-2 border-r-2 border-slate-700 font-black tracking-widest text-amber-500 text-center bg-amber-950/40">
                  Core Grand Slam Titles
                </th>
                <th colSpan={4} className="py-1 border-b-2 border-r-2 border-slate-700 font-black tracking-widest text-blue-400 text-center bg-blue-950/40">
                  Additional Titles
                </th>
                <th colSpan={2} className="py-1 border-b-2 border-r-2 border-slate-700 font-black tracking-widest text-slate-400 text-center bg-slate-900">
                  Summary
                </th>
                <th colSpan={3} className="py-1 border-b-2 border-slate-700 font-black tracking-widest text-emerald-500 text-center bg-emerald-950/20">
                  Extras
                </th>
              </tr>
              {/* Belt Sub-Headers */}
              <tr className="border-b-2 border-slate-700 text-[10px] text-center bg-slate-900 text-slate-400">
                <th className="py-2 px-1 border-r border-slate-800 w-28 bg-amber-950/20">Universal/ Undisputed WWE</th>
                <th className="py-2 px-1 border-r border-slate-800 w-28 bg-amber-950/20">WWE/ World Heavyweight</th>
                <th className="py-2 px-1 border-r border-slate-800 w-28 bg-amber-950/20">Intercontinental</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-amber-950/20">US</th>
                <th className="py-2 px-1 border-r-2 border-slate-700 w-20 bg-amber-950/20 text-amber-600">Tag Team</th>
                <th className="py-2 px-1 border-r border-slate-800 w-24 bg-blue-950/20">Cruiserweight</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-blue-950/20">NXT</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-blue-950/20">UK</th>
                <th className="py-2 px-1 border-r-2 border-slate-700 w-24 bg-blue-950/20 text-blue-500">North American</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16">Total (9)</th>
                <th className="py-2 px-1 border-r-2 border-slate-700 w-24 text-amber-500">Grand Slam Champion (5)</th>
                <th className="py-2 px-1 border-r border-slate-800 w-20 bg-emerald-950/20">Royal Rumble</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-emerald-950/20">MITB</th>
                <th className="py-2 px-1 w-12">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-center text-sm font-medium text-slate-300">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-500">
                    No achievement records found matching your filter "{searchTerm}".
                  </td>
                </tr>
              ) : (
                sortedList.map((a, index) => {
                  const gsScore = computeGrandSlamScore(a);
                  const totalScore = computeTotalScore(a);
                  const isGS = a.grandSlamOrder !== undefined && a.grandSlamOrder > 0;

                  const cellBase = 'border-r border-b border-slate-800/60 transition-colors cursor-pointer select-none';
                  const rowBg = index % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/60';
                  
                  const coreCheckColor = "text-amber-400 text-lg font-black";
                  const addCheckColor = "text-blue-400 text-lg font-black";
                  const extCheckColor = "text-emerald-400 text-lg font-black";

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-800/80 transition-colors duration-150 ${rowBg}`}
                    >
                      {/* Name Column */}
                      <td className={`border-r border-b border-slate-800/60 text-center sticky left-0 z-20 ${rowBg}`}>
                        {isGS ? (
                          <span className="text-red-500 font-bold tracking-wide">
                            {a.superstarName} ({a.grandSlamOrder})
                          </span>
                        ) : (
                          <span className="text-slate-200 hover:text-amber-400 transition-colors">
                            {a.superstarName}
                          </span>
                        )}
                      </td>

                      {/* 5 Core Grand Slam Titles (Clickable Checkboxes) */}
                      <td
                        onClick={() => handleToggleTitle(a, 'univUndisputed')}
                        className={`${cellBase} ${a.univUndisputed ? 'bg-amber-950/30' : ''}`}
                      >
                        {a.univUndisputed ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'worldHw')}
                        className={`${cellBase} ${a.worldHw ? 'bg-amber-950/30' : ''}`}
                      >
                        {a.worldHw ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'ic')}
                        className={`${cellBase} ${a.ic ? 'bg-amber-950/30' : ''}`}
                      >
                        {a.ic ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'us')}
                        className={`${cellBase} ${a.us ? 'bg-amber-950/30' : ''}`}
                      >
                        {a.us ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'tagTeam')}
                        className={`${cellBase} border-r-2 border-r-slate-700 ${a.tagTeam ? 'bg-amber-950/30' : ''}`}
                      >
                        {a.tagTeam ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>

                      {/* 4 Additional Titles (Clickable Checkboxes) */}
                      <td
                        onClick={() => handleToggleTitle(a, 'cruiserweight')}
                        className={`${cellBase} ${a.cruiserweight ? 'bg-blue-950/30' : ''}`}
                      >
                        {a.cruiserweight ? <span className={addCheckColor}>✓</span> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'nxt')}
                        className={`${cellBase} ${a.nxt ? 'bg-blue-950/30' : ''}`}
                      >
                        {a.nxt ? <span className={addCheckColor}>✓</span> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'uk')}
                        className={`${cellBase} ${a.uk ? 'bg-blue-950/30' : ''}`}
                      >
                        {a.uk ? <span className={addCheckColor}>✓</span> : ''}
                      </td>
                      <td
                        onClick={() => handleToggleTitle(a, 'northAmerican')}
                        className={`${cellBase} border-r-2 border-r-slate-700 ${a.northAmerican ? 'bg-blue-950/30' : ''}`}
                      >
                        {a.northAmerican ? <span className={addCheckColor}>✓</span> : ''}
                      </td>

                      {/* Total (9) Column */}
                      <td className="border-r border-b border-slate-800/60 text-center bg-slate-900 font-bold text-slate-300">
                        {totalScore > 0 ? totalScore : ''}
                      </td>

                      {/* Grand Slam Champion (5) Progress Bar Column */}
                      <td 
                        className={`border-r border-b border-slate-800/60 text-center font-bold text-slate-900 ${gsScore === 5 ? 'border-r-8 border-r-green-500' : ''}`}
                        style={{
                          background: gsScore > 0 
                            ? `linear-gradient(to right, #eab308 ${(gsScore / 5) * 100}%, transparent ${(gsScore / 5) * 100}%)`
                            : 'transparent'
                        }}
                      >
                        {gsScore > 0 ? gsScore : ''}
                      </td>

                      {/* Royal Rumble Column */}
                      <td
                        onClick={() => handleToggleTitle(a, 'royalRumble')}
                        className={`${cellBase} ${a.royalRumble ? 'bg-emerald-950/20' : ''}`}
                      >
                        {a.royalRumble ? <span className={extCheckColor}>✓</span> : ''}
                      </td>

                      {/* MITB Column */}
                      <td
                        onClick={() => handleToggleTitle(a, 'mitb')}
                        className={`${cellBase} ${a.mitb ? 'bg-emerald-950/20' : ''}`}
                      >
                        {a.mitb ? <span className={extCheckColor}>✓</span> : ''}
                      </td>

                      {/* Delete Action */}
                      <td className="border-b border-slate-800/60 text-center">
                        <button
                          onClick={() => onDeleteAchievement(a.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition rounded"
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
