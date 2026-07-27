import React from 'react';
import { TabPath, BrandType } from '../types';
import {
  Users,
  Trophy,
  Calendar,
  Crown,
  PieChart,
  Swords,
  Flame,
  Tv,
  Zap,
  RotateCcw,
  Download,
  Upload,
  Plus,
  CloudUpload,
  CloudDownload,
  History
} from 'lucide-react';

interface HeaderNavProps {
  currentTab: TabPath;
  onSelectTab: (tab: TabPath) => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalSuperstarsCount: number;
  onSaveSupabase?: () => void;
  onLoadSupabase?: () => void;
  isCloudSyncing?: boolean;
  supabaseStatus?: 'connected' | 'connecting' | 'disconnected';
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  onLoadSampleData,
  onClearAllData,
  onExportJSON,
  onImportJSON,
  totalSuperstarsCount,
  onSaveSupabase,
  onLoadSupabase,
  isCloudSyncing,
  supabaseStatus = 'connected'
}) => {
  const tabs: { id: TabPath; label: string; icon: React.ReactNode; colorClass: string; badge?: string }[] = [
    {
      id: 'roster',
      label: 'Roster',
      icon: <Users className="w-4 h-4" />,
      colorClass: 'hover:text-emerald-400',
      badge: `${totalSuperstarsCount}`
    },
    {
      id: 'raw',
      label: 'RAW',
      icon: <Flame className="w-4 h-4 text-red-500" />,
      colorClass: 'hover:text-red-400'
    },
    {
      id: 'sd',
      label: 'SD',
      icon: <Zap className="w-4 h-4 text-blue-500" />,
      colorClass: 'hover:text-blue-400'
    },
    {
      id: 'nxt',
      label: 'NXT',
      icon: <Tv className="w-4 h-4 text-yellow-500" />,
      colorClass: 'hover:text-yellow-400'
    },
    {
      id: 'achievement-men',
      label: 'Achievement Men',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      colorClass: 'hover:text-amber-400'
    },
    {
      id: 'achievement-women',
      label: 'Achievement Women',
      icon: <Trophy className="w-4 h-4 text-pink-400" />,
      colorClass: 'hover:text-pink-400'
    },
    {
      id: 'calendar',
      label: 'Calender',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
      colorClass: 'hover:text-purple-400'
    },
    {
      id: 'champ-list',
      label: 'Champ List',
      icon: <Crown className="w-4 h-4 text-yellow-400" />,
      colorClass: 'hover:text-yellow-400'
    },
    {
      id: 'title-history',
      label: '2K25 History',
      icon: <History className="w-4 h-4 text-amber-500" />,
      colorClass: 'hover:text-amber-400',
      badge: 'NEW'
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: <PieChart className="w-4 h-4 text-cyan-400" />,
      colorClass: 'hover:text-cyan-400'
    },
    {
      id: 'rivalry',
      label: 'Rivalry',
      icon: <Swords className="w-4 h-4 text-orange-400" />,
      colorClass: 'hover:text-orange-400'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      {/* Top Main Title & Brand Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-xl tracking-wider text-white">
            <span className="px-2 py-0.5 rounded bg-red-600 text-white shadow-lg shadow-red-600/30 font-extrabold text-sm tracking-tighter">RAW</span>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold text-sm tracking-tighter">SD</span>
            <span className="px-2 py-0.5 rounded bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 font-extrabold text-sm tracking-tighter">NXT</span>
            <span className="ml-2 text-slate-100 font-extrabold tracking-wide">WWE Universe Manager</span>
            <span className="text-xs text-amber-400 font-semibold uppercase px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded">
              2K26 Edition
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {totalSuperstarsCount === 0 && (
            <button
              onClick={onLoadSampleData}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-900/20"
              title="Populate table with the full WWE 2K26 roster from the provided screenshot"
            >
              <Plus className="w-3.5 h-3.5" />
              Load Screenshot Roster
            </button>
          )}

          {totalSuperstarsCount > 0 && (
            <button
              onClick={onClearAllData}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 transition border border-slate-700 hover:border-red-700/50 flex items-center gap-1"
              title="Clear all fields to empty state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Clear Fields
            </button>
          )}

          <label className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition border border-slate-700 flex items-center gap-1">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={onImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={onExportJSON}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 flex items-center gap-1"
            title="Export all data to JSON file backup"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900 border border-slate-800 text-slate-300" title={`Supabase Status: ${supabaseStatus}`}>
            <span className={`w-2 h-2 rounded-full ${
              supabaseStatus === 'connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' :
              supabaseStatus === 'connecting' ? 'bg-amber-400 animate-ping' :
              'bg-red-400'
            }`} />
            <span className="text-[11px] font-medium text-slate-400">
              {supabaseStatus === 'connected' ? 'Supabase Connected' : supabaseStatus === 'connecting' ? 'Connecting...' : 'Supabase Offline'}
            </span>
          </div>

          {onSaveSupabase && (
            <button
              onClick={onSaveSupabase}
              disabled={isCloudSyncing}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 shadow-md shadow-indigo-900/20 disabled:opacity-50"
              title="Save all Universe data to Supabase Cloud"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              {isCloudSyncing ? 'Syncing...' : 'Cloud Save'}
            </button>
          )}

          {onLoadSupabase && (
            <button
              onClick={onLoadSupabase}
              disabled={isCloudSyncing}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1 shadow-md shadow-purple-900/20 disabled:opacity-50"
              title="Load Universe data from Supabase Cloud"
            >
              <CloudDownload className="w-3.5 h-3.5" />
              {isCloudSyncing ? 'Syncing...' : 'Cloud Load'}
            </button>
          )}
        </div>
      </div>

      {/* Primary Horizontal Menu Navigation Tabs */}
      <div className="max-w-[1920px] mx-auto px-2 overflow-x-auto scrollbar-none py-1.5">
        <nav className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            let activeBgClass = 'bg-slate-800 text-white border-slate-600 shadow-md';

            if (tab.id === 'raw') {
              activeBgClass = isActive ? 'bg-red-600 text-white font-bold border-red-500 shadow-lg shadow-red-900/40' : '';
            } else if (tab.id === 'sd') {
              activeBgClass = isActive ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-lg shadow-blue-900/40' : '';
            } else if (tab.id === 'nxt') {
              activeBgClass = isActive ? 'bg-yellow-500 text-black font-bold border-yellow-400 shadow-lg shadow-yellow-900/40' : '';
            } else if (tab.id === 'roster') {
              activeBgClass = isActive ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-lg shadow-emerald-900/40' : '';
            } else {
              activeBgClass = isActive ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg' : 'text-slate-300 hover:bg-slate-800/80';
            }

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-2 border border-transparent ${
                  isActive ? activeBgClass : `text-slate-300 hover:bg-slate-800/60 ${tab.colorClass}`
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
