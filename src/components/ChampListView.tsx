import React, { useState } from 'react';
import { ChampionEntry, Superstar } from '../types';
import { Crown, Plus, Trash2, Edit2, ShieldAlert, Award, Trophy } from 'lucide-react';
import { calculateDaysBetween, formatAcquiredDate, getDisplayAcquiredDate, UNIVERSE_MONTH_ORDER } from '../utils/universeTime';

interface ChampListViewProps {
  champions: ChampionEntry[];
  superstars: Superstar[];
  onAddChampion: (entry: ChampionEntry) => void;
  onUpdateChampion: (entry: ChampionEntry) => void;
  onDeleteChampion: (id: string) => void;
}

export const ChampListView: React.FC<ChampListViewProps> = ({
  champions,
  superstars,
  onAddChampion,
  onUpdateChampion,
  onDeleteChampion
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [titleName, setTitleName] = useState('');
  const [brand, setBrand] = useState<'RAW' | 'SmackDown' | 'NXT' | 'Joint'>('RAW');
  const [currentChampion, setCurrentChampion] = useState('');
  const [sinceYear, setSinceYear] = useState(1);
  const [sinceMonth, setSinceMonth] = useState('May');
  const [sinceWeek, setSinceWeek] = useState('Week 1');
  const [defenses, setDefenses] = useState(2);
  const [previousChampion, setPreviousChampion] = useState('');

  const autoCalculatedDays = calculateDaysBetween(sinceYear, sinceMonth, sinceWeek);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleName.trim() || !currentChampion.trim()) return;

    const newChamp: ChampionEntry = {
      id: `ch-${Date.now()}`,
      titleName: titleName.trim(),
      brand,
      currentChampion: currentChampion.trim(),
      daysHeld: autoCalculatedDays,
      defenses,
      previousChampion: previousChampion.trim(),
      acquiredDate: formatAcquiredDate(sinceYear, sinceMonth, sinceWeek)
    };

    onAddChampion(newChamp);
    setTitleName('');
    setCurrentChampion('');
    setSinceYear(1);
    setSinceMonth('May');
    setSinceWeek('Week 1');
    setDefenses(2);
    setPreviousChampion('');
  };

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-950/90 via-slate-900 to-yellow-950/90 border border-yellow-500/50 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-xl shadow-lg">
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-yellow-300 tracking-wider">
              WWE 2K26 Champions Showcase & Title History
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Active title belts across RAW, SmackDown, NXT & Tag Divisions. Record title changes, days held, and defenses.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
            <Plus className="w-4 h-4 text-yellow-400" />
            Add / Update Championship Belt
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Championship Title Name</label>
              <input
                type="text"
                placeholder="e.g. Undisputed WWE Championship"
                value={titleName}
                onChange={(e) => setTitleName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="RAW">RAW</option>
                  <option value="SmackDown">SmackDown</option>
                  <option value="NXT">NXT</option>
                  <option value="Joint">Joint / Women Tag</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Current Champion</label>
                <input
                  type="text"
                  list="all-superstars-list"
                  placeholder="Superstar Name..."
                  value={currentChampion}
                  onChange={(e) => setCurrentChampion(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
                <datalist id="all-superstars-list">
                  {superstars.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 border border-yellow-500/30 rounded-lg space-y-2">
              <label className="block text-xs font-bold text-yellow-400 flex justify-between items-center">
                <span>Won Since (Universe Date)</span>
                <span className="text-[10px] text-slate-400 font-normal">Now: Yr 2, May, W3</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={sinceYear}
                  onChange={(e) => setSinceYear(Number(e.target.value))}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs font-semibold focus:border-yellow-500"
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                </select>
                <select
                  value={sinceMonth}
                  onChange={(e) => setSinceMonth(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs font-semibold focus:border-yellow-500"
                >
                  {UNIVERSE_MONTH_ORDER.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={sinceWeek}
                  onChange={(e) => setSinceWeek(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs font-semibold focus:border-yellow-500"
                >
                  <option value="Week 1">Week 1</option>
                  <option value="Week 2">Week 2</option>
                  <option value="Week 3">Week 3</option>
                  <option value="Week 4">Week 4</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Days Held (Auto Calculated)</label>
                <div className="w-full p-2 bg-slate-950/80 border border-yellow-500/50 rounded text-yellow-300 font-black text-sm flex items-center justify-between">
                  <span>{autoCalculatedDays} Days</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-semibold">AUTO</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title Defenses</label>
                <input
                  type="number"
                  min="0"
                  value={defenses}
                  onChange={(e) => setDefenses(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Previous Champion</label>
              <input
                type="text"
                placeholder="Previous title holder..."
                value={previousChampion}
                onChange={(e) => setPreviousChampion(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg transition shadow-lg mt-2 uppercase tracking-wide"
            >
              Save Championship Record
            </button>
          </form>
        </div>

        {/* Title Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {champions.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-slate-900 border border-yellow-500/40 shadow-xl relative flex flex-col justify-between hover:border-yellow-400 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.brand === 'RAW' ? 'bg-red-950 text-red-300 border border-red-800' :
                    c.brand === 'SmackDown' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    c.brand === 'NXT' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {c.brand}
                  </span>

                  <button
                    onClick={() => onDeleteChampion(c.id)}
                    className="p-1 text-slate-500 hover:text-red-400"
                    title="Delete title record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                  <h3 className="font-extrabold text-slate-100 text-sm leading-snug">{c.titleName}</h3>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 mb-2">
                  <span className="text-[10px] uppercase text-amber-500 font-bold block">Current Champion:</span>
                  <span className="text-base font-black text-white">{c.currentChampion}</span>
                </div>

                {c.previousChampion && (
                  <p className="text-xs text-slate-400">
                    Defeated <span className="font-semibold text-slate-200">{c.previousChampion}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-300 font-semibold">{c.daysHeld} Days Reign</span>
                  {c.acquiredDate && (
                    <span className="text-[10px] text-purple-300 font-medium">Won: {getDisplayAcquiredDate(c.acquiredDate)}</span>
                  )}
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                  {c.defenses} Defenses
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
