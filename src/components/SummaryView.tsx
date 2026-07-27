import React from 'react';
import { AppState } from '../types';
import { PieChart, Users, Crown, Swords, Calendar, Download, Upload, RotateCcw, Flame, Zap, Tv } from 'lucide-react';

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
    </div>
  );
};
