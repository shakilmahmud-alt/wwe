import React, { useState } from 'react';
import { AchievementFemale, BrandType, Superstar } from '../types';
import { Trophy, Plus, Trash2, Search, Heart, Sparkles } from 'lucide-react';

interface AchievementsWomenProps {
  achievements: AchievementFemale[];
  superstars: Superstar[];
  onAddAchievement: (entry: AchievementFemale) => void;
  onUpdateAchievement: (entry: AchievementFemale) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementsWomen: React.FC<AchievementsWomenProps> = ({
  achievements,
  superstars,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('ALL');

  // New record form state
  const [superstarName, setSuperstarName] = useState('');
  const [brand, setBrand] = useState<BrandType>('RAW');
  const [royalRumbleCount, setRoyalRumbleCount] = useState(0);
  const [mitbCount, setMitbCount] = useState(0);
  const [chamberCount, setChamberCount] = useState(0);
  const [grandSlam, setGrandSlam] = useState(false);
  const [rivalryOfYearCount, setRivalryOfYearCount] = useState(0);
  const [titleReignsCount, setTitleReignsCount] = useState(0);

  const femaleSuperstars = superstars.filter((s) => s.tier === 'Female');

  const filteredList = achievements.filter((a) => {
    const matchesSearch = a.superstarName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === 'ALL' || a.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superstarName.trim()) return;

    const newRecord: AchievementFemale = {
      id: `aw-${Date.now()}`,
      superstarName: superstarName.trim(),
      brand,
      royalRumbleCount,
      mitbCount,
      chamberCount,
      grandSlam,
      rivalryOfYearCount,
      titleReignsCount
    };

    onAddAchievement(newRecord);
    setSuperstarName('');
    setRoyalRumbleCount(0);
    setMitbCount(0);
    setChamberCount(0);
    setRivalryOfYearCount(0);
    setTitleReignsCount(0);
  };

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-pink-950/80 via-slate-900 to-purple-950/80 border border-pink-500/40 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-500/20 border border-pink-500/40 rounded-xl shadow-lg">
            <Sparkles className="w-7 h-7 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-pink-300 tracking-wider">
              Women's Division Achievements & Accolades
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Track Women's Royal Rumble wins, MITB briefcases, Elimination Chamber triumphs, Grand Slam Champions, and total title reigns.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-pink-400 flex items-center gap-2">
            <Plus className="w-4 h-4 text-pink-400" />
            Log Women's Achievement Record
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Superstar Name</label>

              <input
                type="text"
                list="female-superstars-list"
                placeholder="Type or select superstar..."
                value={superstarName}
                onChange={(e) => setSuperstarName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-pink-500"
              />
              <datalist id="female-superstars-list">
                {femaleSuperstars.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as BrandType)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="RAW">RAW</option>
                  <option value="SmackDown">SmackDown</option>
                  <option value="NXT">NXT</option>
                  <option value="Free Agent">Free Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title Reigns Count</label>
                <input
                  type="number"
                  min="0"
                  value={titleReignsCount}
                  onChange={(e) => setTitleReignsCount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Royal Rumble</label>
                <input
                  type="number"
                  min="0"
                  value={royalRumbleCount}
                  onChange={(e) => setRoyalRumbleCount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">MITB Briefcase</label>
                <input
                  type="number"
                  min="0"
                  value={mitbCount}
                  onChange={(e) => setMitbCount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Chamber Wins</label>
                <input
                  type="number"
                  min="0"
                  value={chamberCount}
                  onChange={(e) => setChamberCount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 bg-slate-950 p-2 border border-slate-800 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={grandSlam}
                  onChange={(e) => setGrandSlam(e.target.checked)}
                  className="accent-pink-500"
                />
                <span className="font-semibold text-pink-300">Grand Slam Champion</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-lg transition shadow-lg mt-2 uppercase tracking-wide"
            >
              Save Women's Achievement
            </button>
          </form>
        </div>

        {/* Table List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search female superstar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Brand:</span>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="p-1.5 bg-slate-950 border border-slate-700 rounded text-white"
              >
                <option value="ALL">All Brands</option>
                <option value="RAW">RAW</option>
                <option value="SmackDown">SmackDown</option>
                <option value="NXT">NXT</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <table className="w-full text-xs text-left text-slate-200">
              <thead className="bg-slate-950 uppercase font-bold text-[10px] text-pink-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Superstar</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Rumble</th>
                  <th className="p-3">MITB</th>
                  <th className="p-3">Chamber</th>
                  <th className="p-3">Title Reigns</th>
                  <th className="p-3">Grand Slam</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                      No women's achievement records found. Use the form on the left to add one!
                    </td>
                  </tr>
                ) : (
                  filteredList.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white text-sm">{a.superstarName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.brand === 'RAW' ? 'bg-red-950 text-red-300 border border-red-800' :
                          a.brand === 'SmackDown' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          'bg-yellow-950 text-yellow-300 border border-yellow-800'
                        }`}>
                          {a.brand}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{a.royalRumbleCount}x</td>
                      <td className="p-3 font-semibold text-slate-300">{a.mitbCount}x</td>
                      <td className="p-3 font-semibold text-slate-300">{a.chamberCount}x</td>
                      <td className="p-3 font-bold text-pink-300">{a.titleReignsCount} Reigns</td>
                      <td className="p-3">
                        {a.grandSlam ? (
                          <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded text-[10px] font-bold">
                            Grand Slam
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteAchievement(a.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
