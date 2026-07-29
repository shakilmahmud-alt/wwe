import React, { useState } from 'react';
import { AchievementFemale } from '../types';
import { Sparkles, Plus, Trash2, Search, Filter, ArrowUpDown, Flame } from 'lucide-react';

interface AchievementsWomenProps {
  achievements: AchievementFemale[];
  onAddAchievement: (entry: AchievementFemale) => void;
  onUpdateAchievement: (entry: AchievementFemale) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementsWomen: React.FC<AchievementsWomenProps> = ({
  achievements,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'GRAND_SLAM' | 'CLOSE_GS' | 'HAS_TITLE'>('ALL');
  const [sortMode, setSortMode] = useState<'NAME' | 'TOTAL' | 'GRAND_SLAM_ORDER'>('NAME');
  
  // New Record Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSuperstarName, setNewSuperstarName] = useState('');
  const [newGrandSlamOrder, setNewGrandSlamOrder] = useState('');

  const computeGrandSlamScore = (a: AchievementFemale) => {
    let score = 0;
    if (a.rawWomen) score++;
    if (a.sdWomen) score++;
    if (a.ic) score++;
    if (a.us) score++;
    if (a.womenTag) score++;
    return score;
  };

  const isGrandSlamChampion = (a: AchievementFemale) => {
    return a.grandSlamOrder !== undefined && a.grandSlamOrder > 0;
  };

  const computeTotalScore = (a: AchievementFemale) => {
    let total = 0;
    if (a.rawWomen) total++;
    if (a.sdWomen) total++;
    if (a.ic) total++;
    if (a.us) total++;
    if (a.womenTag) total++;
    if (a.nxt) total++;
    if (a.nxtUk) total++;
    if (a.nxtNa) total++;
    if (a.nxtTag) total++;
    return total;
  };

  const handleToggleTitle = (entry: AchievementFemale, field: keyof AchievementFemale) => {
    onUpdateAchievement({
      ...entry,
      [field]: !entry[field]
    });
  };

  const handleNumberChange = (id: string, field: 'royalRumbleCount' | 'mitbCount', value: number) => {
    const entry = achievements.find(a => a.id === id);
    if (entry) {
      onUpdateAchievement({ ...entry, [field]: value });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuperstarName.trim()) return;

    const orderNum = parseInt(newGrandSlamOrder);

    const newRecord: AchievementFemale = {
      id: `aw-${Date.now()}`,
      superstarName: newSuperstarName.trim(),
      grandSlamOrder: !isNaN(orderNum) && orderNum > 0 ? orderNum : undefined,
      royalRumbleCount: 0,
      mitbCount: 0
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
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-pink-950/70 to-slate-900 border border-pink-500/30 rounded-2xl p-6 shadow-2xl flex-none">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl shadow-lg shadow-pink-500/20 text-slate-950 font-black">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-full uppercase tracking-wider">
                  WWE 2K25 & 2K26 Hall of Records
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {totalGrandSlamCount} Historic Grand Slam Champions
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                Women's Division Championship Tracker <span className="text-pink-400 font-normal text-lg">(Spreadsheet View)</span>
              </h1>
              <p className="text-sm text-slate-300 mt-0.5">
                Grand Slam Champion requires all 3 core titles: RAW, SD, and Women's Tag. Click any cell to toggle titles!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> {showAddForm ? 'Close Form' : 'Add Superstar'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Superstar Collapsible Form */}
      {showAddForm && (
        <div className="p-5 bg-slate-900/95 border border-pink-500/40 rounded-xl shadow-xl animate-fadeIn space-y-4 flex-none">
          <h3 className="text-sm font-bold text-pink-400 flex items-center gap-2">
            <Plus className="w-4 h-4 text-pink-400" /> Log New Superstar to Achievement Spreadsheet
          </h3>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4 text-xs">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-slate-400 mb-1 font-semibold">Superstar Name *</label>
              <input
                type="text"
                placeholder="e.g. Becky Lynch"
                required
                value={newSuperstarName}
                onChange={(e) => setNewSuperstarName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
            <div className="w-32">
              <label className="block text-slate-400 mb-1 font-semibold">GS Order #</label>
              <input
                type="number"
                placeholder="(Optional)"
                value={newGrandSlamOrder}
                onChange={(e) => setNewGrandSlamOrder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg shadow-md transition-colors"
            >
              Add Row
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
            placeholder="Search superstar (e.g. Becky, Bayley)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/80 focus:ring-1 focus:ring-pink-500/50 transition-all shadow-inner"
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
            <Filter className="w-3.5 h-3.5 text-pink-500" /> Filter:
          </span>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'ALL'
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-slate-950 shadow-md font-black'
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
                ? 'bg-pink-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/80 text-pink-400 hover:text-white border border-slate-800'
            }`}
          >
            ⚡ Close (4/5 Titles)
          </button>
          <button
            onClick={() => setFilterMode('HAS_TITLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'HAS_TITLE'
                ? 'bg-purple-600 text-white shadow-md font-black'
                : 'bg-slate-950/80 text-purple-400 hover:text-white border border-slate-800'
            }`}
          >
            At Least 1 Title
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-pink-500" /> Sort:
          </span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as 'NAME' | 'TOTAL' | 'GRAND_SLAM_ORDER')}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 outline-none focus:border-pink-500"
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
                <th colSpan={5} className="py-1 border-b-2 border-r-2 border-slate-700 font-black tracking-widest text-pink-500 text-center bg-pink-950/40">
                  Core Grand Slam Titles
                </th>
                <th colSpan={4} className="py-1 border-b-2 border-r-2 border-slate-700 font-black tracking-widest text-purple-400 text-center bg-purple-950/40">
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
                <th className="py-2 px-1 border-r border-slate-800 w-28 bg-pink-950/20">RAW/Women's World</th>
                <th className="py-2 px-1 border-r border-slate-800 w-28 bg-pink-950/20">SD/WWE Women's</th>
                <th className="py-2 px-1 border-r border-slate-800 w-28 bg-pink-950/20">Intercontinental</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-pink-950/20">US</th>
                <th className="py-2 px-1 border-r-2 border-slate-700 w-28 bg-pink-950/20 text-pink-600">Women's Tag</th>
                
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-purple-950/20">NXT</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-purple-950/20">NXT UK</th>
                <th className="py-2 px-1 border-r border-slate-800 w-20 bg-purple-950/20">NXT NA</th>
                <th className="py-2 px-1 border-r-2 border-slate-700 w-24 bg-purple-950/20 text-purple-500">NXT Tag Team</th>
                
                <th className="py-2 px-1 border-r border-slate-800 w-16">Total (9)</th>
                <th className="py-2 px-1 border-r-2 border-slate-700 w-24 text-pink-500">Grand Slam Champion (5)</th>
                
                <th className="py-2 px-1 border-r border-slate-800 w-20 bg-emerald-950/20">Royal Rumble</th>
                <th className="py-2 px-1 border-r border-slate-800 w-16 bg-emerald-950/20">MITB</th>
                <th className="py-2 px-1 w-12">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-center text-sm font-medium text-slate-300">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500">
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
                  
                  const coreCheckColor = "text-pink-400 text-lg font-black";
                  const addCheckColor = "text-purple-400 text-lg font-black";
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
                          <span className="text-slate-200 hover:text-pink-400 transition-colors">
                            {a.superstarName}
                          </span>
                        )}
                      </td>

                      {/* CORE GS TITLES */}
                      <td className={cellBase} onClick={() => handleToggleTitle(a, 'rawWomen')}>
                        {a.rawWomen ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td className={cellBase} onClick={() => handleToggleTitle(a, 'sdWomen')}>
                        {a.sdWomen ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td className={cellBase} onClick={() => handleToggleTitle(a, 'ic')}>
                        {a.ic ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td className={cellBase} onClick={() => handleToggleTitle(a, 'us')}>
                        {a.us ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>
                      <td className={`${cellBase} border-r-2 border-slate-700`} onClick={() => handleToggleTitle(a, 'womenTag')}>
                        {a.womenTag ? <span className={coreCheckColor}>✓</span> : ''}
                      </td>

                      {/* ADDITIONAL TITLES */}
                      <td className={cellBase} onClick={() => handleToggleTitle(a, 'nxt')}>
                        {a.nxt ? <span className={addCheckColor}>✓</span> : ''}
                      </td>
                      <td className={cellBase} onClick={() => handleToggleTitle(a, 'nxtUk')}>
                        {a.nxtUk ? <span className={addCheckColor}>✓</span> : ''}
                      </td>
                      <td className={cellBase} onClick={() => handleToggleTitle(a, 'nxtNa')}>
                        {a.nxtNa ? <span className={addCheckColor}>✓</span> : ''}
                      </td>
                      <td className={`${cellBase} border-r-2 border-slate-700`} onClick={() => handleToggleTitle(a, 'nxtTag')}>
                        {a.nxtTag ? <span className={addCheckColor}>✓</span> : ''}
                      </td>

                      {/* TOTAL */}
                      <td className="border-r border-b border-slate-800/60 font-bold text-slate-300">
                        {totalScore > 0 ? totalScore : ''}
                      </td>

                      {/* GRAND SLAM SCORE */}
                      <td className="border-r-2 border-b border-slate-700 p-0 h-full">
                        <div className={`w-full h-full min-h-[40px] flex items-center justify-center font-black transition-colors ${
                          gsScore === 5 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-slate-950 shadow-inner' :
                          gsScore === 4 ? 'bg-gradient-to-r from-yellow-500/50 to-yellow-600/50 text-yellow-100' :
                          gsScore === 3 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-300' :
                          gsScore === 2 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent text-yellow-500/80' :
                          'text-slate-500'
                        }`}>
                          {gsScore > 0 ? gsScore : ''}
                        </div>
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
      </div>
    </div>
  );
};
