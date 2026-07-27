import React, { useState } from 'react';
import { AppState } from '../types';
import { PieChart, Users, Crown, Swords, Calendar, Download, Upload, RotateCcw, Flame, Zap, Tv, Award, Trophy, Clock } from 'lucide-react';
import { getDisplayAcquiredDate } from '../utils/universeTime';

interface SummaryViewProps {
  appState: AppState;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  appState,
  onLoadSampleData,
  onClearAllData,
  onExportJSON,
  onImportJSON
}) => {
  const { superstars, womenTagTeams, champions, rivalries, calendarEvents } = appState;
  const [matrixBrand, setMatrixBrand] = useState<'All' | 'RAW' | 'SmackDown' | 'NXT'>('All');

  const YEAR_1_MATRIX = [
    {
      month: 'May',
      raw: { whc: 'Gunther', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Lyra Valkyria', tag: 'The War Raiders' },
      sd: { und: 'Cody Rhodes', us: 'Shinsuke', wwe: 'Tiffany Stratton', wus: 'Chelsea Green', tag: '#DIY' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Roxanne', wna: 'Fallon Henley', tag: 'Tony D' },
      joint: { wtag: 'Bianca & Jade' }
    },
    {
      month: 'June',
      raw: { whc: 'Gunther', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Lyra Valkyria', tag: 'The War Raiders' },
      sd: { und: 'Cody Rhodes', us: 'Shinsuke', wwe: 'Tiffany Stratton', wus: 'Chelsea Green', tag: '#DIY' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Roxanne', wna: 'Fallon Henley', tag: 'Tony D' },
      joint: { wtag: 'Bianca & Jade' }
    },
    {
      month: 'July',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Lyra Valkyria', tag: 'The War Raiders' },
      sd: { und: 'Cody Rhodes', us: 'Randy Orton', wwe: 'Tiffany Stratton', wus: 'Chelsea Green', tag: '#DIY' },
      nxt: { nxt: 'Trick Williams', na: 'Trick Williams', wnxt: 'Roxanne', wna: 'Fallon Henley', tag: 'The Family' },
      joint: { wtag: 'Giulia & Fallon' }
    },
    {
      month: 'August',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The War Raiders' },
      sd: { und: 'Cody Rhodes', us: 'Randy Orton', wwe: 'Tiffany Stratton', wus: 'Chelsea Green', tag: 'The Bloodline' },
      nxt: { nxt: 'Trick Williams', na: 'Trick Williams', wnxt: 'Giulia', wna: 'Fallon Henley', tag: 'The Family' },
      joint: { wtag: 'Giulia & Fallon' }
    },
    {
      month: 'September',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The War Raiders' },
      sd: { und: 'Cody Rhodes', us: 'Randy Orton', wwe: 'Tiffany Stratton', wus: 'Chelsea Green', tag: 'The Bloodline' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Giulia', wna: 'Fallon Henley', tag: 'The Family' },
      joint: { wtag: 'Giulia & Fallon' }
    },
    {
      month: 'October',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The War Raiders' },
      sd: { und: 'Cody Rhodes', us: 'Randy Orton', wwe: 'Tiffany Stratton', wus: 'Chelsea Green', tag: 'The Bloodline' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Giulia', wna: 'Fallon Henley', tag: 'The Family' },
      joint: { wtag: 'Giulia & Fallon' }
    },
    {
      month: 'November',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The War Raiders' },
      sd: { und: 'Cody Rhodes', us: 'Randy Orton', wwe: 'Tiffany Stratton', wus: 'Chelsea Green', tag: 'The Bloodline' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Roxanne', wna: 'Fallon Henley', tag: 'Chase U' },
      joint: { wtag: 'Giulia & Fallon' }
    },
    {
      month: 'December',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The New Day' },
      sd: { und: 'Cody Rhodes', us: 'Randy Orton', wwe: 'Naomi', wus: 'Chelsea Green', tag: 'Brothers of Dest.' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Roxanne', wna: 'Kelani Jordan', tag: 'Chase U' },
      joint: { wtag: 'Uto & Becky' }
    },
    {
      month: 'January',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The New Day' },
      sd: { und: 'LA Knight', us: 'Carmelo Hayes', wwe: 'Naomi', wus: 'Naomi', tag: 'Brothers of Dest.' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Roxanne', wna: 'Kelani Jordan', tag: 'Dudley Boyz' },
      joint: { wtag: 'Uto & Becky' }
    },
    {
      month: 'February',
      raw: { whc: 'Drew McIntyre', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The New Day' },
      sd: { und: 'LA Knight', us: 'Carmelo Hayes', wwe: 'Naomi', wus: 'Naomi', tag: 'Wyatt Sicks' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Giulia', wna: 'Kelani Jordan', tag: 'Dudley Boyz' },
      joint: { wtag: 'Uto & Becky' }
    },
    {
      month: 'March',
      raw: { whc: 'CM Punk', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The New Day' },
      sd: { und: 'LA Knight', us: 'Carmelo Hayes', wwe: 'Naomi', wus: 'Naomi', tag: 'Wyatt Sicks' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Giulia', wna: 'Kelani Jordan', tag: 'Dudley Boyz' },
      joint: { wtag: 'Uto & Becky' }
    },
    {
      month: 'April (WrestleMania)',
      raw: { whc: 'Gunther', ic: 'Bron Breakker', wwc: 'Rhea Ripley', wic: 'Asuka', tag: 'The War Raiders' },
      sd: { und: 'Jacob Fatu', us: 'Carmelo Hayes', wwe: 'Jade Cargill', wus: 'Naomi', tag: 'Wyatt Sicks' },
      nxt: { nxt: 'Trick Williams', na: 'Oba Femi', wnxt: 'Giulia', wna: 'Kelani Jordan', tag: 'Charlie Dempsey' },
      joint: { wtag: 'Kabuki Warriors' }
    }
  ];

  const rawCount = superstars.filter((s) => s.brand === 'RAW').length;
  const sdCount = superstars.filter((s) => s.brand === 'SmackDown').length;
  const nxtCount = superstars.filter((s) => s.brand === 'NXT').length;
  const totalRoster = superstars.length;

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

      {/* Active Champions Duration Tracker (Auto-Calculated) */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black uppercase text-amber-400 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Current Universe Champions & Duration Tracker
            </h2>
            <p className="text-xs text-slate-400">
              Auto-calculated reign duration from acquisition date up to current game time: <span className="text-amber-300 font-bold">Year 2 • May (Week 3)</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> 1 Year Complete • Yr 2 Active
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {champions.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    c.brand === 'RAW' ? 'bg-red-950 text-red-300 border border-red-800' :
                    c.brand === 'SmackDown' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    c.brand === 'NXT' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
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

      {/* Year 1 Month-by-Month Championship Matrix Spreadsheet (Like Image 3) */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black uppercase text-yellow-400 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Year 1 Month-by-Month Title History Spreadsheet
            </h2>
            <p className="text-xs text-slate-400">
              Complete chronological breakdown of title holders across May to April (WrestleMania), reflecting all title changes.
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
          <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-slate-700 bg-slate-950 text-slate-300 font-extrabold uppercase">
                <th className="p-2.5 w-32 sticky left-0 bg-slate-950 z-10 border-r border-slate-800">Month</th>
                {(matrixBrand === 'All' || matrixBrand === 'SmackDown') && (
                  <>
                    <th className="p-2.5 text-blue-400 bg-blue-950/20">SD Undisputed WWE</th>
                    <th className="p-2.5 text-blue-400 bg-blue-950/20">SD Men's US</th>
                    <th className="p-2.5 text-blue-400 bg-blue-950/20">SD WWE Women's</th>
                    <th className="p-2.5 text-blue-400 bg-blue-950/20">SD Women's US</th>
                    <th className="p-2.5 text-blue-400 bg-blue-950/20 border-r border-slate-800">SD Tag Team</th>
                  </>
                )}
                {(matrixBrand === 'All' || matrixBrand === 'RAW') && (
                  <>
                    <th className="p-2.5 text-red-400 bg-red-950/20">RAW World Heavyweight</th>
                    <th className="p-2.5 text-red-400 bg-red-950/20">RAW Men's IC</th>
                    <th className="p-2.5 text-red-400 bg-red-950/20">RAW Women's World</th>
                    <th className="p-2.5 text-red-400 bg-red-950/20">RAW Women's IC</th>
                    <th className="p-2.5 text-red-400 bg-red-950/20 border-r border-slate-800">RAW World Tag</th>
                  </>
                )}
                {(matrixBrand === 'All' || matrixBrand === 'NXT') && (
                  <>
                    <th className="p-2.5 text-yellow-400 bg-yellow-950/20">NXT Men's World</th>
                    <th className="p-2.5 text-yellow-400 bg-yellow-950/20">NXT Men's NA</th>
                    <th className="p-2.5 text-yellow-400 bg-yellow-950/20">NXT Women's World</th>
                    <th className="p-2.5 text-yellow-400 bg-yellow-950/20">NXT Women's NA</th>
                    <th className="p-2.5 text-yellow-400 bg-yellow-950/20">NXT Tag Team</th>
                  </>
                )}
                {matrixBrand === 'All' && (
                  <th className="p-2.5 text-purple-400 bg-purple-950/20">Women's Tag (Joint)</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {YEAR_1_MATRIX.map((row, idx) => {
                const isWM = row.month.includes('April');
                return (
                  <tr key={row.month} className={`hover:bg-slate-800/40 transition ${isWM ? 'bg-amber-950/30 font-bold border-t-2 border-amber-500/50' : idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'}`}>
                    <td className={`p-2.5 font-extrabold sticky left-0 z-10 border-r border-slate-800 flex items-center justify-between ${isWM ? 'bg-amber-950 text-amber-300' : 'bg-slate-950 text-slate-300'}`}>
                      <span>{row.month}</span>
                      {isWM && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                    </td>
                    {(matrixBrand === 'All' || matrixBrand === 'SmackDown') && (
                      <>
                        <td className="p-2.5 text-blue-200">{row.sd.und}</td>
                        <td className="p-2.5 text-blue-200">{row.sd.us}</td>
                        <td className="p-2.5 text-blue-200">{row.sd.wwe}</td>
                        <td className="p-2.5 text-blue-200">{row.sd.wus}</td>
                        <td className="p-2.5 text-blue-200 border-r border-slate-800">{row.sd.tag}</td>
                      </>
                    )}
                    {(matrixBrand === 'All' || matrixBrand === 'RAW') && (
                      <>
                        <td className="p-2.5 text-red-200">{row.raw.whc}</td>
                        <td className="p-2.5 text-red-200">{row.raw.ic}</td>
                        <td className="p-2.5 text-red-200">{row.raw.wwc}</td>
                        <td className="p-2.5 text-red-200">{row.raw.wic}</td>
                        <td className="p-2.5 text-red-200 border-r border-slate-800">{row.raw.tag}</td>
                      </>
                    )}
                    {(matrixBrand === 'All' || matrixBrand === 'NXT') && (
                      <>
                        <td className="p-2.5 text-yellow-200">{row.nxt.nxt}</td>
                        <td className="p-2.5 text-yellow-200">{row.nxt.na}</td>
                        <td className="p-2.5 text-yellow-200">{row.nxt.wnxt}</td>
                        <td className="p-2.5 text-yellow-200">{row.nxt.wna}</td>
                        <td className="p-2.5 text-yellow-200">{row.nxt.tag}</td>
                      </>
                    )}
                    {matrixBrand === 'All' && (
                      <td className="p-2.5 text-purple-200 font-bold">{row.joint.wtag}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
