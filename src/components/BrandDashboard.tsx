import React, { useState } from 'react';
import { Superstar, BrandType, TierType, ChampionEntry, RivalryEntry, ShowPlan, MatchCardItem } from '../types';
import { Plus, Trash2, Edit2, Flame, Zap, Tv, Crown, Swords, Calendar, UserPlus, Check, X } from 'lucide-react';

interface BrandDashboardProps {
  brand: BrandType;
  superstars: Superstar[];
  champions: ChampionEntry[];
  rivalries: RivalryEntry[];
  showPlans: ShowPlan[];
  onAddSuperstar: (name: string, brand: BrandType, tier: TierType) => void;
  onUpdateSuperstarName: (id: string, name: string) => void;
  onDeleteSuperstar: (id: string) => void;
  onMoveSuperstar: (id: string, newBrand: BrandType, newTier: TierType) => void;
  onSaveShowPlan: (plan: ShowPlan) => void;
  onDeleteShowPlan: (id: string) => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({
  brand,
  superstars,
  champions,
  rivalries,
  showPlans,
  onAddSuperstar,
  onUpdateSuperstarName,
  onDeleteSuperstar,
  onMoveSuperstar,
  onSaveShowPlan,
  onDeleteShowPlan
}) => {
  const brandSuperstars = superstars.filter((s) => s.brand === brand);
  const brandChampions = champions.filter((c) => c.brand === brand || c.brand === 'Joint');
  const brandRivalries = rivalries.filter((r) => r.brand === brand || r.brand === 'Joint');

  // Input states
  const [newSuperstarName, setNewSuperstarName] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierType>('Top');

  // Episode plan creation state
  const [isCreatingShow, setIsCreatingShow] = useState(false);
  const [episodeName, setEpisodeName] = useState(`${brand} Episode #${showPlans.length + 1}`);
  const [showDate, setShowDate] = useState('Upcoming');
  const [arena, setArena] = useState('');
  const [matches, setMatches] = useState<MatchCardItem[]>([
    { id: 'm-1', matchNumber: 1, matchType: 'Singles Match', wrestler1: '', wrestler2: '', winner: '', notes: 'Opening Match' },
    { id: 'm-2', matchNumber: 2, matchType: 'Tag Team Match', wrestler1: '', wrestler2: '', winner: '', notes: 'Midcard Match' },
    { id: 'm-3', matchNumber: 3, matchType: 'Main Event', wrestler1: '', wrestler2: '', winner: '', notes: 'Main Event' }
  ]);

  // Brand style configs
  const getBrandTheme = () => {
    if (brand === 'RAW') {
      return {
        bg: 'bg-red-600',
        text: 'text-red-500',
        border: 'border-red-600',
        cardBg: 'bg-red-950/30 border-red-800/60',
        icon: <Flame className="w-6 h-6 text-red-500" />,
        accentBtn: 'bg-red-600 hover:bg-red-500 text-white'
      };
    } else if (brand === 'SmackDown') {
      return {
        bg: 'bg-blue-600',
        text: 'text-blue-500',
        border: 'border-blue-600',
        cardBg: 'bg-blue-950/30 border-blue-800/60',
        icon: <Zap className="w-6 h-6 text-blue-500" />,
        accentBtn: 'bg-blue-600 hover:bg-blue-500 text-white'
      };
    } else {
      return {
        bg: 'bg-yellow-500 text-slate-950',
        text: 'text-yellow-500',
        border: 'border-yellow-500',
        cardBg: 'bg-yellow-950/30 border-yellow-800/60',
        icon: <Tv className="w-6 h-6 text-yellow-500" />,
        accentBtn: 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold'
      };
    }
  };

  const theme = getBrandTheme();

  const handleAddSuperstarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSuperstarName.trim()) {
      onAddSuperstar(newSuperstarName.trim(), brand, selectedTier);
      setNewSuperstarName('');
    }
  };

  const handleAddMatchRow = () => {
    setMatches((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        matchNumber: prev.length + 1,
        matchType: 'Singles Match',
        wrestler1: '',
        wrestler2: '',
        winner: ''
      }
    ]);
  };

  const handleSaveShowSubmit = () => {
    if (!episodeName.trim()) return;
    const newPlan: ShowPlan = {
      id: `show-${Date.now()}`,
      brand,
      episodeName,
      date: showDate,
      arena,
      matches
    };
    onSaveShowPlan(newPlan);
    setIsCreatingShow(false);
  };

  const tiersList: TierType[] = ['Top', 'Middle', 'Low', 'Female', 'Tag Team'];

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Brand Header Banner */}
      <div className={`p-6 rounded-xl shadow-2xl border ${theme.border} ${theme.cardBg} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900/80 rounded-lg shadow-inner border border-slate-700">
            {theme.icon}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wider uppercase flex items-center gap-3">
              <span>{brand} Division & Storylines</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your {brand} superstars, match cards, champions & active rivalries.
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Roster Count</span>
            <span className="text-base font-black text-white">{brandSuperstars.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Champions</span>
            <span className="text-base font-black text-amber-400">{brandChampions.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Active Feuds</span>
            <span className="text-base font-black text-orange-400">{brandRivalries.length}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Roster & Show Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Brand Superstars by Tier */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Superstar Card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Add New Superstar to {brand}
            </h3>
            <form onSubmit={handleAddSuperstarSubmit} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Superstar or Team Name..."
                value={newSuperstarName}
                onChange={(e) => setNewSuperstarName(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as TierType)}
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="Top">Top (Main Event)</option>
                <option value="Middle">Middle (Midcard)</option>
                <option value="Low">Low (Lower Card)</option>
                <option value="Female">Female Division</option>
                <option value="Tag Team">Tag Team</option>
              </select>
              <button
                type="submit"
                className={`px-4 py-2 text-xs font-bold rounded-lg transition shadow-md ${theme.accentBtn}`}
              >
                Add Superstar
              </button>
            </form>
          </div>

          {/* Roster Tiers Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {tiersList.map((tier) => {
              const tierWrestlers = brandSuperstars.filter((s) => s.tier === tier);
              return (
                <div key={tier} className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {tier} ({tierWrestlers.length})
                    </span>
                    <span className="text-[10px] text-slate-500">{brand}</span>
                  </div>

                  <div className="space-y-1.5 flex-1 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                    {tierWrestlers.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">No superstars in {tier}</p>
                    ) : (
                      tierWrestlers.map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition group text-xs"
                        >
                          <span className="font-semibold text-slate-200">{w.name}</span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <select
                              value={w.tier}
                              onChange={(e) => onMoveSuperstar(w.id, brand, e.target.value as TierType)}
                              className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-slate-300"
                              title="Move tier"
                            >
                              <option value="Top">Top</option>
                              <option value="Middle">Mid</option>
                              <option value="Low">Low</option>
                              <option value="Female">Fem</option>
                              <option value="Tag Team">Tag</option>
                            </select>
                            <button
                              onClick={() => onDeleteSuperstar(w.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition"
                              title="Delete Superstar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Match Card Builder & Champions */}
        <div className="space-y-6">
          {/* Champions Showcase Widget */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-amber-400" />
              {brand} Active Champions
            </h3>
            {brandChampions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No champions logged for {brand} yet.</p>
            ) : (
              <div className="space-y-2">
                {brandChampions.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-500 block">{c.titleName}</span>
                      <span className="font-extrabold text-white text-sm">{c.currentChampion}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <div>{c.daysHeld} Days Reign</div>
                      <div className="text-emerald-400 font-semibold">{c.defenses} Defenses</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Show Match Card Planner */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                {brand} Match Card Planner
              </h3>
              {!isCreatingShow && (
                <button
                  onClick={() => setIsCreatingShow(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md shadow ${theme.accentBtn}`}
                >
                  + New Episode Card
                </button>
              )}
            </div>

            {isCreatingShow ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-700 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-400">Create {brand} Show Card</span>
                  <button onClick={() => setIsCreatingShow(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Episode Name"
                    value={episodeName}
                    onChange={(e) => setEpisodeName(e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Date / Week"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>

                {/* Match Rows */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
                  {matches.map((m, idx) => (
                    <div key={m.id} className="p-2 bg-slate-900 border border-slate-800 rounded space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300">Match #{idx + 1} ({m.matchType})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          placeholder="Wrestler/Team 1"
                          value={m.wrestler1}
                          onChange={(e) => {
                            const updated = [...matches];
                            updated[idx].wrestler1 = e.target.value;
                            setMatches(updated);
                          }}
                          className="p-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-white"
                        />
                        <input
                          type="text"
                          placeholder="Wrestler/Team 2"
                          value={m.wrestler2}
                          onChange={(e) => {
                            const updated = [...matches];
                            updated[idx].wrestler2 = e.target.value;
                            setMatches(updated);
                          }}
                          className="p-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-white"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Winner / Result"
                        value={m.winner || ''}
                        onChange={(e) => {
                          const updated = [...matches];
                          updated[idx].winner = e.target.value;
                          setMatches(updated);
                        }}
                        className="w-full p-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-emerald-400 font-semibold"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button onClick={handleAddMatchRow} className="text-xs text-blue-400 hover:underline">
                    + Add Match
                  </button>
                  <button
                    onClick={handleSaveShowSubmit}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                  >
                    Save Show Card
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {showPlans.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No show match cards saved for {brand} yet.</p>
                ) : (
                  showPlans.map((plan) => (
                    <div key={plan.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-100">{plan.episodeName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{plan.date}</span>
                          <button
                            onClick={() => onDeleteShowPlan(plan.id)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {plan.matches.map((m, i) => (
                          <div key={m.id} className="text-xs p-1.5 bg-slate-900 rounded flex justify-between items-center">
                            <span className="text-slate-300">
                              <span className="text-slate-500 font-bold mr-1.5">#{i + 1}</span>
                              {m.wrestler1 || 'TBD'} vs {m.wrestler2 || 'TBD'}
                            </span>
                            {m.winner && (
                              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">
                                Winner: {m.winner}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
