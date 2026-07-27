import React, { useState, useEffect, useRef } from 'react';
import {
  TabPath,
  AppState,
  Superstar,
  BrandType,
  TierType,
  WomenTagTeam,
  AchievementMale,
  AchievementFemale,
  CalendarEvent,
  ChampionEntry,
  RivalryEntry,
  ShowPlan
} from './types';
import { initialEmptyState, sampleFullData } from './data/sampleRoster';
import { saveToSupabase, loadFromSupabase, checkSupabaseConnection, SUPABASE_TABLE_NAME } from './lib/supabase';
import { HeaderNav } from './components/HeaderNav';
import { RosterSpreadsheet } from './components/RosterSpreadsheet';
import { BrandDashboard } from './components/BrandDashboard';
import { AchievementsMen } from './components/AchievementsMen';
import { AchievementsWomen } from './components/AchievementsWomen';
import { CalendarView } from './components/CalendarView';
import { ChampListView } from './components/ChampListView';
import { SummaryView } from './components/SummaryView';
import { RivalryView } from './components/RivalryView';
import { TitleHistoryView } from './components/TitleHistoryView';

const STORAGE_KEY = 'wwe2k26_universe_data_v2';

export default function App() {
  // 1. URL Path & Hash Sync State
  const getTabFromURL = (): TabPath => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const pathname = window.location.pathname.replace('/', '');

    const validTabs: TabPath[] = [
      'roster',
      'raw',
      'sd',
      'nxt',
      'achievement-men',
      'achievement-women',
      'calendar',
      'champ-list',
      'summary',
      'rivalry',
      'title-history'
    ];

    if (validTabs.includes(hash as TabPath)) return hash as TabPath;
    if (validTabs.includes(pathname as TabPath)) return pathname as TabPath;
    return 'roster';
  };

  const [currentTab, setCurrentTab] = useState<TabPath>(getTabFromURL);

  // Sync tab changes with browser URL address bar
  const handleSelectTab = (tab: TabPath) => {
    setCurrentTab(tab);
    window.location.hash = `#/${tab}`;
    if (window.history.pushState) {
      window.history.pushState(null, '', `/#/${tab}`);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getTabFromURL();
      setCurrentTab(newTab);
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // 2. Persistent State
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load local storage state:', err);
    }
    return initialEmptyState;
  });

  const isHydratedRef = useRef(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // Initial Boot: Verify Supabase connection AND fetch Cloud data if available
  useEffect(() => {
    let isMounted = true;
    async function initCloudAndHydrate() {
      const ok = await checkSupabaseConnection();
      if (!isMounted) return;

      setSupabaseStatus(ok ? 'connected' : 'disconnected');

      if (ok) {
        try {
          const cloudRes = await loadFromSupabase();
          if (isMounted && cloudRes.success && cloudRes.data) {
            const cloudData = cloudRes.data;
            const cloudSuperstarCount = cloudData.superstars?.length || 0;

            const savedLocal = localStorage.getItem(STORAGE_KEY);
            const localData = savedLocal ? JSON.parse(savedLocal) : null;
            const localSuperstarCount = localData?.superstars?.length || 0;

            // If Supabase has data and local storage is empty or has fewer items, hydrate from Supabase Cloud!
            if (cloudSuperstarCount > 0 && (localSuperstarCount === 0 || cloudSuperstarCount >= localSuperstarCount)) {
              setAppState(cloudData);
              console.log('Hydrated state from Supabase Cloud on boot');
            }
          }
        } catch (e) {
          console.error('Cloud hydration error:', e);
        }
      }
      isHydratedRef.current = true;
    }

    initCloudAndHydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save state to LocalStorage and auto-sync to Supabase (after hydration is ready)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }

    // NEVER auto-overwrite Supabase until initial mount cloud check is finished
    if (!isHydratedRef.current) {
      return;
    }

    // Debounce auto-save to Supabase to prevent empty/half-edited overwrites
    const timer = setTimeout(async () => {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setIsCloudSyncing(true);
        try {
          await saveToSupabase(appState);
        } catch (err) {
          console.error('Auto Supabase sync error:', err);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [appState]);

  const handleSaveSupabase = async () => {
    setIsCloudSyncing(true);
    try {
      const res = await saveToSupabase(appState);
      if (res.success) {
        alert('Successfully saved WWE Universe data to Supabase Cloud! ☁️');
      } else {
        alert(
          `Failed to save to Supabase. Make sure you have created the '${SUPABASE_TABLE_NAME}' table in your Supabase SQL Editor with:\n\nCREATE TABLE IF NOT EXISTS ${SUPABASE_TABLE_NAME} (\n  id TEXT PRIMARY KEY,\n  data JSONB,\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nError: ` +
            (res.error?.message || JSON.stringify(res.error))
        );
      }
    } catch (err: any) {
      alert('Error saving to Supabase: ' + (err?.message || err));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleLoadSupabase = async () => {
    setIsCloudSyncing(true);
    try {
      const res = await loadFromSupabase();
      if (res.success && res.data) {
        setAppState(res.data);
        alert('Successfully loaded WWE Universe data from Supabase Cloud! ☁️');
      } else {
        alert(
          `Failed to load from Supabase. Either no save data exists yet, or the '${SUPABASE_TABLE_NAME}' table is not created in Supabase.\n\nError: ` +
            (res.error?.message || JSON.stringify(res.error))
        );
      }
    } catch (err: any) {
      alert('Error loading from Supabase: ' + (err?.message || err));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Handlers for Superstars
  const handleAddSuperstar = (name: string, brand: BrandType, tier: TierType) => {
    const newSuperstar: Superstar = {
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      brand,
      tier
    };
    setAppState((prev) => ({
      ...prev,
      superstars: [...prev.superstars, newSuperstar]
    }));
  };

  const handleUpdateSuperstarName = (id: string, name: string) => {
    setAppState((prev) => ({
      ...prev,
      superstars: prev.superstars.map((s) => (s.id === id ? { ...s, name } : s))
    }));
  };

  const handleDeleteSuperstar = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      superstars: prev.superstars.filter((s) => s.id !== id)
    }));
  };

  const handleMoveSuperstar = (id: string, newBrand: BrandType, newTier: TierType) => {
    setAppState((prev) => ({
      ...prev,
      superstars: prev.superstars.map((s) => (s.id === id ? { ...s, brand: newBrand, tier: newTier } : s))
    }));
  };

  // Handlers for Women Tag Teams
  const handleAddWomenTagTeam = (teamName: string) => {
    const newTeam: WomenTagTeam = {
      id: `wt-${Date.now()}`,
      teamName,
      brand: 'Women Tag'
    };
    setAppState((prev) => ({
      ...prev,
      womenTagTeams: [...prev.womenTagTeams, newTeam]
    }));
  };

  const handleUpdateWomenTagTeam = (id: string, teamName: string) => {
    setAppState((prev) => ({
      ...prev,
      womenTagTeams: prev.womenTagTeams.map((t) => (t.id === id ? { ...t, teamName } : t))
    }));
  };

  const handleDeleteWomenTagTeam = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      womenTagTeams: prev.womenTagTeams.filter((t) => t.id !== id)
    }));
  };

  // Handlers for Show Plans
  const handleSaveShowPlan = (plan: ShowPlan) => {
    setAppState((prev) => {
      if (plan.brand === 'RAW') {
        return { ...prev, rawShowPlans: [plan, ...prev.rawShowPlans] };
      } else if (plan.brand === 'SmackDown') {
        return { ...prev, sdShowPlans: [plan, ...prev.sdShowPlans] };
      } else {
        return { ...prev, nxtShowPlans: [plan, ...prev.nxtShowPlans] };
      }
    });
  };

  const handleDeleteShowPlan = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      rawShowPlans: prev.rawShowPlans.filter((p) => p.id !== id),
      sdShowPlans: prev.sdShowPlans.filter((p) => p.id !== id),
      nxtShowPlans: prev.nxtShowPlans.filter((p) => p.id !== id)
    }));
  };

  // Handlers for Achievements
  const handleAddAchievementMale = (entry: AchievementMale) => {
    setAppState((prev) => ({
      ...prev,
      achievementsMen: [entry, ...prev.achievementsMen]
    }));
  };

  const handleUpdateAchievementMale = (entry: AchievementMale) => {
    setAppState((prev) => ({
      ...prev,
      achievementsMen: prev.achievementsMen.map((a) => (a.id === entry.id ? entry : a))
    }));
  };

  const handleDeleteAchievementMale = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      achievementsMen: prev.achievementsMen.filter((a) => a.id !== id)
    }));
  };

  const handleAddAchievementFemale = (entry: AchievementFemale) => {
    setAppState((prev) => ({
      ...prev,
      achievementsWomen: [entry, ...prev.achievementsWomen]
    }));
  };

  const handleUpdateAchievementFemale = (entry: AchievementFemale) => {
    setAppState((prev) => ({
      ...prev,
      achievementsWomen: prev.achievementsWomen.map((a) => (a.id === entry.id ? entry : a))
    }));
  };

  const handleDeleteAchievementFemale = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      achievementsWomen: prev.achievementsWomen.filter((a) => a.id !== id)
    }));
  };

  // Handlers for Calendar
  const handleAddCalendarEvent = (event: CalendarEvent) => {
    setAppState((prev) => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, event]
    }));
  };

  const handleToggleCalendarComplete = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted } : e))
    }));
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.filter((e) => e.id !== id)
    }));
  };

  const handlePopulateDefaultSchedule = () => {
    setAppState((prev) => {
      const existingNames = new Set(prev.calendarEvents.map((e) => e.eventName.toLowerCase()));
      const newEvents = sampleFullData.calendarEvents.filter(
        (e) => !existingNames.has(e.eventName.toLowerCase())
      );
      return {
        ...prev,
        calendarEvents: [...prev.calendarEvents, ...newEvents]
      };
    });
  };

  // Handlers for Champions
  const handleAddChampion = (entry: ChampionEntry) => {
    setAppState((prev) => ({
      ...prev,
      champions: [entry, ...prev.champions]
    }));
  };

  const handleUpdateChampion = (entry: ChampionEntry) => {
    setAppState((prev) => ({
      ...prev,
      champions: prev.champions.map((c) => (c.id === entry.id ? entry : c))
    }));
  };

  const handleDeleteChampion = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      champions: prev.champions.filter((c) => c.id !== id)
    }));
  };

  // Handlers for Rivalries
  const handleAddRivalry = (entry: RivalryEntry) => {
    setAppState((prev) => ({
      ...prev,
      rivalries: [entry, ...prev.rivalries]
    }));
  };

  const handleUpdateRivalry = (entry: RivalryEntry) => {
    setAppState((prev) => ({
      ...prev,
      rivalries: prev.rivalries.map((r) => (r.id === entry.id ? entry : r))
    }));
  };

  const handleDeleteRivalry = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      rivalries: prev.rivalries.filter((r) => r.id !== id)
    }));
  };

  // Utility actions: Load Sample Data / Clear / Export / Import
  const handleLoadSampleData = () => {
    setAppState(sampleFullData);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all roster and storyline fields?')) {
      setAppState(initialEmptyState);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'wwe2k26_universe_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.superstars)) {
            setAppState(parsed);
            alert('Successfully imported WWE 2K26 Universe data!');
          } else {
            alert('Invalid backup JSON format.');
          }
        } catch (err) {
          alert('Error parsing JSON file.');
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation Menu */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onLoadSampleData={handleLoadSampleData}
        onClearAllData={handleClearAllData}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        totalSuperstarsCount={appState.superstars.filter(s => s.tier !== 'Tag Team').length}
        onSaveSupabase={handleSaveSupabase}
        onLoadSupabase={handleLoadSupabase}
        isCloudSyncing={isCloudSyncing}
        supabaseStatus={supabaseStatus}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 w-full pb-12">
        {currentTab === 'roster' && (
          <RosterSpreadsheet
            superstars={appState.superstars}
            womenTagTeams={appState.womenTagTeams}
            onAddSuperstar={handleAddSuperstar}
            onUpdateSuperstarName={handleUpdateSuperstarName}
            onDeleteSuperstar={handleDeleteSuperstar}
            onMoveSuperstar={handleMoveSuperstar}
            onAddWomenTagTeam={handleAddWomenTagTeam}
            onDeleteWomenTagTeam={handleDeleteWomenTagTeam}
            onUpdateWomenTagTeam={handleUpdateWomenTagTeam}
          />
        )}

        {currentTab === 'raw' && (
          <BrandDashboard
            brand="RAW"
            superstars={appState.superstars}
            champions={appState.champions}
            rivalries={appState.rivalries}
            showPlans={appState.rawShowPlans}
            onAddSuperstar={handleAddSuperstar}
            onUpdateSuperstarName={handleUpdateSuperstarName}
            onDeleteSuperstar={handleDeleteSuperstar}
            onMoveSuperstar={handleMoveSuperstar}
            onSaveShowPlan={handleSaveShowPlan}
            onDeleteShowPlan={handleDeleteShowPlan}
            onAddChampion={handleAddChampion}
            onUpdateChampion={handleUpdateChampion}
            onDeleteChampion={handleDeleteChampion}
          />
        )}

        {currentTab === 'sd' && (
          <BrandDashboard
            brand="SmackDown"
            superstars={appState.superstars}
            champions={appState.champions}
            rivalries={appState.rivalries}
            showPlans={appState.sdShowPlans}
            onAddSuperstar={handleAddSuperstar}
            onUpdateSuperstarName={handleUpdateSuperstarName}
            onDeleteSuperstar={handleDeleteSuperstar}
            onMoveSuperstar={handleMoveSuperstar}
            onSaveShowPlan={handleSaveShowPlan}
            onDeleteShowPlan={handleDeleteShowPlan}
            onAddChampion={handleAddChampion}
            onUpdateChampion={handleUpdateChampion}
            onDeleteChampion={handleDeleteChampion}
          />
        )}

        {currentTab === 'nxt' && (
          <BrandDashboard
            brand="NXT"
            superstars={appState.superstars}
            champions={appState.champions}
            rivalries={appState.rivalries}
            showPlans={appState.nxtShowPlans}
            onAddSuperstar={handleAddSuperstar}
            onUpdateSuperstarName={handleUpdateSuperstarName}
            onDeleteSuperstar={handleDeleteSuperstar}
            onMoveSuperstar={handleMoveSuperstar}
            onSaveShowPlan={handleSaveShowPlan}
            onDeleteShowPlan={handleDeleteShowPlan}
            onAddChampion={handleAddChampion}
            onUpdateChampion={handleUpdateChampion}
            onDeleteChampion={handleDeleteChampion}
          />
        )}

        {currentTab === 'achievement-men' && (
          <AchievementsMen
            achievements={appState.achievementsMen}
            superstars={appState.superstars}
            onAddAchievement={handleAddAchievementMale}
            onUpdateAchievement={handleUpdateAchievementMale}
            onDeleteAchievement={handleDeleteAchievementMale}
          />
        )}

        {currentTab === 'achievement-women' && (
          <AchievementsWomen
            achievements={appState.achievementsWomen}
            superstars={appState.superstars}
            onAddAchievement={handleAddAchievementFemale}
            onUpdateAchievement={handleUpdateAchievementFemale}
            onDeleteAchievement={handleDeleteAchievementFemale}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            events={appState.calendarEvents}
            onAddEvent={handleAddCalendarEvent}
            onToggleComplete={handleToggleCalendarComplete}
            onDeleteEvent={handleDeleteCalendarEvent}
            onPopulateDefaultSchedule={handlePopulateDefaultSchedule}
          />
        )}

        {currentTab === 'champ-list' && (
          <ChampListView
            champions={appState.champions}
            superstars={appState.superstars}
            onAddChampion={handleAddChampion}
            onUpdateChampion={handleUpdateChampion}
            onDeleteChampion={handleDeleteChampion}
          />
        )}

        {currentTab === 'title-history' && <TitleHistoryView />}

        {currentTab === 'summary' && (
          <SummaryView
            appState={appState}
            onLoadSampleData={handleLoadSampleData}
            onClearAllData={handleClearAllData}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
          />
        )}

        {currentTab === 'rivalry' && (
          <RivalryView
            rivalries={appState.rivalries}
            superstars={appState.superstars}
            onAddRivalry={handleAddRivalry}
            onUpdateRivalry={handleUpdateRivalry}
            onDeleteRivalry={handleDeleteRivalry}
          />
        )}
      </main>
    </div>
  );
}
