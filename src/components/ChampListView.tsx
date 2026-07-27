import React, { useState } from 'react';
import { ChampionEntry, BrandType, Superstar } from '../types';
import { Crown, Plus, Trash2, Edit2, ShieldAlert, Award, Trophy } from 'lucide-react';

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
  const [daysHeld, setDaysHeld] = useState(30);
  const [defenses, setDefenses] = useState(2);
  const [previousChampion, setPreviousChampion] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleName.trim() || !currentChampion.trim()) return;

    const newChamp: ChampionEntry = {
      id: `ch-${Date.now()}`,
      titleName: titleName.trim(),
      brand,
      currentChampion: currentChampion.trim(),
      daysHeld,
      defenses,
      previousChampion: previousChampion.trim()
    };

    onAddChampion(newChamp);
    setTitleName('');
    setCurrentChampion('');
    setDaysHeld(30);
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Days Held</label>
                <input
                  type="number"
                  min="0"
                  value={daysHeld}
                  onChange={(e) => setDaysHeld(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
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
                <span className="text-slate-300 font-semibold">{c.daysHeld} Days Reign</span>
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
