import React, { useState } from 'react';
import { RivalryEntry, BrandType, Superstar } from '../types';
import { Swords, Plus, Trash2, ShieldAlert, Flame, CheckCircle, Zap } from 'lucide-react';

interface RivalryViewProps {
  rivalries: RivalryEntry[];
  superstars: Superstar[];
  onAddRivalry: (entry: RivalryEntry) => void;
  onUpdateRivalry: (entry: RivalryEntry) => void;
  onDeleteRivalry: (id: string) => void;
}

export const RivalryView: React.FC<RivalryViewProps> = ({
  rivalries,
  superstars,
  onAddRivalry,
  onUpdateRivalry,
  onDeleteRivalry
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<'RAW' | 'SmackDown' | 'NXT' | 'Joint'>('RAW');
  const [rival1, setRival1] = useState('');
  const [rival2, setRival2] = useState('');
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High' | 'Heated'>('Heated');
  const [type, setType] = useState<'1v1' | 'Tag Team' | '3-Way' | 'Championship' | 'Faction War'>('1v1');
  const [currentStage, setCurrentStage] = useState<'Beginning' | 'Escalation' | 'Blowout Match at PLE' | 'Resolved'>('Escalation');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rival1.trim() || !rival2.trim()) return;

    const newRiv: RivalryEntry = {
      id: `riv-${Date.now()}`,
      name: name.trim(),
      brand,
      rival1: rival1.trim(),
      rival2: rival2.trim(),
      intensity,
      type,
      currentStage,
      notes: notes.trim()
    };

    onAddRivalry(newRiv);
    setName('');
    setRival1('');
    setRival2('');
    setNotes('');
  };

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-orange-950/80 via-slate-900 to-red-950/80 border border-orange-500/40 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 border border-orange-500/40 rounded-xl shadow-lg">
            <Swords className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-orange-300 tracking-wider">
              WWE 2K26 Universe Rivalries & Feuds
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Create intense storylines, track feud stages, rival intensity, match history, and blowout PLE conclusions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
            <Plus className="w-4 h-4 text-orange-400" />
            Create New Rivalry / Feud
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Rivalry Title / Tagline</label>
              <input
                type="text"
                placeholder="e.g. CM Punk vs Gunther - World Supremacy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Rival 1</label>
                <input
                  type="text"
                  list="superstars-list"
                  placeholder="First Superstar..."
                  value={rival1}
                  onChange={(e) => setRival1(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rival 2</label>
                <input
                  type="text"
                  list="superstars-list"
                  placeholder="Second Superstar..."
                  value={rival2}
                  onChange={(e) => setRival2(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
              <datalist id="superstars-list">
                {superstars.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
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
                  <option value="Joint">Joint / Cross-Brand</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Feud Intensity</label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Heated">Heated 🔥</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Rivalry Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="1v1">1v1 Singles</option>
                  <option value="Tag Team">Tag Team</option>
                  <option value="3-Way">Triple Threat</option>
                  <option value="Championship">Championship Feud</option>
                  <option value="Faction War">Faction War</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Current Stage</label>
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="Beginning">1. Beginning</option>
                  <option value="Escalation">2. Escalation</option>
                  <option value="Blowout Match at PLE">3. Blowout at PLE</option>
                  <option value="Resolved">4. Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Storyline Notes & Backstory</label>
              <textarea
                rows={3}
                placeholder="Describe how the feud started and next planned match..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-lg transition shadow-lg mt-2 uppercase tracking-wide"
            >
              Start Feud
            </button>
          </form>
        </div>

        {/* Rivalry Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rivalries.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-slate-900 border border-orange-500/30 shadow-xl relative flex flex-col justify-between hover:border-orange-500 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.brand === 'RAW' ? 'bg-red-950 text-red-300 border border-red-800' :
                      r.brand === 'SmackDown' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      r.brand === 'NXT' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {r.brand} • {r.type}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.intensity === 'Heated' ? 'bg-red-600 text-white shadow' :
                      r.intensity === 'High' ? 'bg-orange-600 text-white' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {r.intensity}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-tight mb-2">{r.name}</h3>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-around mb-3 text-sm font-extrabold">
                    <span className="text-red-400">{r.rival1}</span>
                    <span className="text-slate-500 font-normal text-xs uppercase">VS</span>
                    <span className="text-blue-400">{r.rival2}</span>
                  </div>

                  {r.notes && (
                    <p className="text-xs text-slate-400 italic mb-2">"{r.notes}"</p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-bold">Stage: {r.currentStage}</span>
                  <button
                    onClick={() => onDeleteRivalry(r.id)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
