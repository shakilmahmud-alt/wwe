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
  ArchiveEntry,
  RivalryEntry,
  ShowPlan
} from './types';
import { initialEmptyState, sampleFullData } from './data/sampleRoster';
import { UNIVERSE_MONTH_ORDER } from './utils/universeTime';
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
      'summary'
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
        const parsed = JSON.parse(saved);
        if (!parsed.historyMatrix || parsed.historyMatrix.length === 0 || !parsed.historyMatrix[0]?.champions) {
          parsed.historyMatrix = sampleFullData.historyMatrix;
        }
        if (!parsed.matrixColumns || parsed.matrixColumns.length === 0) {
          parsed.matrixColumns = sampleFullData.matrixColumns;
        }
        if (!parsed.emptyMatrix || parsed.emptyMatrix.length === 0 || !parsed.emptyMatrix[0]?.champions) {
          parsed.emptyMatrix = sampleFullData.emptyMatrix;
        }
        if (!parsed.championArchive || parsed.championArchive.length === 0) {
          parsed.championArchive = sampleFullData.championArchive;
        }
        return parsed;
      }
    } catch (err) {
      console.error('Failed to load local storage state:', err);
    }
    return initialEmptyState;
  });

  const isHydratedRef = useRef(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // One-time hydration fix for championArchive and achievementsMen
  useEffect(() => {
    let needsUpdate = false;
    const nextState = { ...appState };

    if (!appState.championArchive || appState.championArchive.length === 0) {
      nextState.championArchive = sampleFullData.championArchive;
      needsUpdate = true;
    }

    if (!appState.achievementsMen || appState.achievementsMen.length === 0) {
      nextState.achievementsMen = sampleFullData.achievementsMen;
      needsUpdate = true;
    }

    const hasAnyWomenData = appState.achievementsWomen?.some((a) => a.rawWomen || a.sdWomen || a.nxt || a.ic || a.us || a.womenTag || a.nxtUk || a.nxtNa || a.nxtTag);
    if (!appState.achievementsWomen || appState.achievementsWomen.length < 66 || !hasAnyWomenData) {
      nextState.achievementsWomen = sampleFullData.achievementsWomen;
      needsUpdate = true;
    }

    if (!appState.matrixColumns || appState.matrixColumns.length === 0) {
      nextState.matrixColumns = sampleFullData.matrixColumns;
      needsUpdate = true;
    }

    if (!appState.historyMatrix || appState.historyMatrix.length === 0) {
      nextState.historyMatrix = sampleFullData.historyMatrix;
      needsUpdate = true;
    }

    if (!appState.emptyMatrix || appState.emptyMatrix.length === 0) {
      nextState.emptyMatrix = sampleFullData.emptyMatrix;
      needsUpdate = true;
    }

    if (needsUpdate) {
      setAppState(nextState);
    }
  }, []);

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

            const savedLocal = localStorage.getItem(STORAGE_KEY);
            const localData = savedLocal ? JSON.parse(savedLocal) : null;

            // Helper to check if a matrix contains actual user-filled text data
            const isMatrixFilled = (matrix?: HistoryMatrixRow[]): boolean => {
              if (!matrix || matrix.length === 0) return false;
              return matrix.some((row) => row.champions && Object.keys(row.champions).some((key) => row.champions[key] && row.champions[key].trim() !== ''));
            };

            // Smart merge matrix data: prefer filled matrix (whether local or cloud) over empty blank arrays
            const finalEmptyMatrix = isMatrixFilled(localData?.emptyMatrix)
              ? localData.emptyMatrix
              : isMatrixFilled(cloudData?.emptyMatrix)
              ? cloudData.emptyMatrix
              : (localData?.emptyMatrix || cloudData?.emptyMatrix || sampleFullData.emptyMatrix);

            const finalHistoryMatrix = isMatrixFilled(localData?.historyMatrix)
              ? localData.historyMatrix
              : isMatrixFilled(cloudData?.historyMatrix)
              ? cloudData.historyMatrix
              : (localData?.historyMatrix || cloudData?.historyMatrix || sampleFullData.historyMatrix);

            const baseChamps = (cloudData.champions && cloudData.champions.length > 0) ? cloudData.champions : sampleFullData.champions;
            const mergedChampions = baseChamps.map((cloudChamp: ChampionEntry) => {
              const localChamp = localData?.champions?.find((lc: ChampionEntry) => lc.id === cloudChamp.id || lc.titleName === cloudChamp.titleName);
              return {
                ...cloudChamp,
                wrestlerImage: localChamp?.wrestlerImage || cloudChamp.wrestlerImage,
                beltImage: localChamp?.beltImage || cloudChamp.beltImage
              };
            });

            // Lossless Smart Merge for Achievement Men (Preserves Royal Rumble & MITB counters!)
            const getRRCountMen = (a?: AchievementMale) => a?.royalRumbleCount ?? (a?.royalRumble ? 1 : 0);
            const getMITBCountMen = (a?: AchievementMale) => a?.mitbCount ?? (a?.mitb ? 1 : 0);
            const baseMen = (cloudData.achievementsMen && cloudData.achievementsMen.length > 0) ? cloudData.achievementsMen : (localData?.achievementsMen || sampleFullData.achievementsMen);
            const menMap = new Map<string, AchievementMale>();
            for (const item of baseMen) {
              menMap.set((item.id || item.superstarName).toLowerCase(), { ...item });
            }
            if (localData?.achievementsMen) {
              for (const localItem of localData.achievementsMen) {
                const key = (localItem.id || localItem.superstarName).toLowerCase();
                const existing = menMap.get(key);
                if (existing) {
                  const rr = Math.max(getRRCountMen(existing), getRRCountMen(localItem));
                  const mb = Math.max(getMITBCountMen(existing), getMITBCountMen(localItem));
                  menMap.set(key, {
                    ...existing,
                    ...localItem,
                    royalRumbleCount: rr,
                    mitbCount: mb,
                    royalRumble: rr > 0,
                    mitb: mb > 0,
                    univUndisputed: existing.univUndisputed || localItem.univUndisputed,
                    worldHw: existing.worldHw || localItem.worldHw,
                    ic: existing.ic || localItem.ic,
                    us: existing.us || localItem.us,
                    tagTeam: existing.tagTeam || localItem.tagTeam,
                    cruiserweight: existing.cruiserweight || localItem.cruiserweight,
                    nxt: existing.nxt || localItem.nxt,
                    uk: existing.uk || localItem.uk,
                    northAmerican: existing.northAmerican || localItem.northAmerican,
                    notes: localItem.notes || existing.notes
                  });
                } else {
                  menMap.set(key, { ...localItem });
                }
              }
            }
            const mergedAchievementsMen = Array.from(menMap.values());

            // Lossless Smart Merge for Achievement Women (Preserves Royal Rumble & MITB counters!)
            const getRRCountWomen = (a?: AchievementFemale) => a?.royalRumbleCount ?? (a?.royalRumble ? 1 : 0);
            const getMITBCountWomen = (a?: AchievementFemale) => a?.mitbCount ?? (a?.mitb ? 1 : 0);
            const baseWomen = (cloudData.achievementsWomen && cloudData.achievementsWomen.length > 0) ? cloudData.achievementsWomen : (localData?.achievementsWomen || sampleFullData.achievementsWomen);
            const womenMap = new Map<string, AchievementFemale>();
            for (const item of baseWomen) {
              womenMap.set((item.id || item.superstarName).toLowerCase(), { ...item });
            }
            if (localData?.achievementsWomen) {
              for (const localItem of localData.achievementsWomen) {
                const key = (localItem.id || localItem.superstarName).toLowerCase();
                const existing = womenMap.get(key);
                if (existing) {
                  const rr = Math.max(getRRCountWomen(existing), getRRCountWomen(localItem));
                  const mb = Math.max(getMITBCountWomen(existing), getMITBCountWomen(localItem));
                  womenMap.set(key, {
                    ...existing,
                    ...localItem,
                    royalRumbleCount: rr,
                    mitbCount: mb,
                    royalRumble: rr > 0,
                    mitb: mb > 0,
                    rawWomen: existing.rawWomen || localItem.rawWomen,
                    sdWomen: existing.sdWomen || localItem.sdWomen,
                    nxt: existing.nxt || localItem.nxt,
                    womenTag: existing.womenTag || localItem.womenTag,
                    nxtTag: existing.nxtTag || localItem.nxtTag,
                    nxtUk: existing.nxtUk || localItem.nxtUk,
                    nxtNa: existing.nxtNa || localItem.nxtNa,
                    ic: existing.ic || localItem.ic,
                    us: existing.us || localItem.us,
                    notes: localItem.notes || existing.notes
                  });
                } else {
                  womenMap.set(key, { ...localItem });
                }
              }
            }
            const mergedAchievementsWomen = Array.from(womenMap.values());

            // Lossless Smart Merge for Champion Archive
            const archiveMap = new Map<string, ArchiveEntry>();
            const baseArchive = (cloudData.championArchive && cloudData.championArchive.length > 0) ? cloudData.championArchive : (localData?.championArchive || sampleFullData.championArchive);
            for (const item of baseArchive) {
              archiveMap.set(item.id, { ...item });
            }
            if (localData?.championArchive) {
              for (const localItem of localData.championArchive) {
                const existing = archiveMap.get(localItem.id);
                if (existing) {
                  archiveMap.set(localItem.id, { ...existing, ...localItem });
                } else {
                  archiveMap.set(localItem.id, { ...localItem });
                }
              }
            }
            const mergedChampionArchive = Array.from(archiveMap.values());

            // Lossless Smart Merge for Superstars (Preserves all 322+ superstars!)
            const superstarsMap = new Map<string, Superstar>();
            const baseSuperstars = (cloudData.superstars && cloudData.superstars.length > 0) ? cloudData.superstars : (localData?.superstars || sampleFullData.superstars);
            for (const s of baseSuperstars) {
              superstarsMap.set(s.id, s);
            }
            if (localData?.superstars) {
              for (const s of localData.superstars) {
                if (!superstarsMap.has(s.id)) {
                  superstarsMap.set(s.id, s);
                }
              }
            }
            const mergedSuperstars = sortSuperstarsAlphabetically(Array.from(superstarsMap.values()));

            // Lossless Smart Merge for Women Tag Teams
            const tagMap = new Map<string, WomenTagTeam>();
            const baseTags = (cloudData.womenTagTeams && cloudData.womenTagTeams.length > 0) ? cloudData.womenTagTeams : (localData?.womenTagTeams || sampleFullData.womenTagTeams);
            for (const t of baseTags) {
              tagMap.set(t.id, t);
            }
            if (localData?.womenTagTeams) {
              for (const t of localData.womenTagTeams) {
                if (!tagMap.has(t.id)) {
                  tagMap.set(t.id, t);
                }
              }
            }
            const mergedWomenTagTeams = sortWomenTagTeamsAlphabetically(Array.from(tagMap.values()));

            // Lossless Smart Merge for Calendar Events
            const eventsMap = new Map<string, CalendarEvent>();
            const baseEvents = (cloudData.calendarEvents && cloudData.calendarEvents.length > 0) ? cloudData.calendarEvents : (localData?.calendarEvents || sampleFullData.calendarEvents);
            for (const ev of baseEvents) {
              eventsMap.set(ev.id, ev);
            }
            if (localData?.calendarEvents) {
              for (const ev of localData.calendarEvents) {
                const existing = eventsMap.get(ev.id);
                if (existing) {
                  eventsMap.set(ev.id, { ...existing, ...ev, isCompleted: existing.isCompleted || ev.isCompleted });
                } else {
                  eventsMap.set(ev.id, ev);
                }
              }
            }
            const mergedCalendarEvents = Array.from(eventsMap.values());

            // Lossless Smart Merge for Weekly Show Plans
            const mergeShowPlans = (cloudPlans?: ShowPlan[], localPlans?: ShowPlan[]) => {
              const planMap = new Map<string, ShowPlan>();
              const base = (cloudPlans && cloudPlans.length > 0) ? cloudPlans : (localPlans || []);
              for (const p of base) planMap.set(p.id, p);
              if (localPlans) {
                for (const p of localPlans) if (!planMap.has(p.id)) planMap.set(p.id, p);
              }
              return Array.from(planMap.values());
            };

            const mergedState: AppState = {
              ...cloudData,
              superstars: mergedSuperstars,
              womenTagTeams: mergedWomenTagTeams,
              champions: mergedChampions,
              emptyMatrix: finalEmptyMatrix,
              historyMatrix: finalHistoryMatrix,
              achievementsMen: mergedAchievementsMen,
              achievementsWomen: mergedAchievementsWomen,
              championArchive: mergedChampionArchive,
              calendarEvents: mergedCalendarEvents,
              rawShowPlans: mergeShowPlans(cloudData.rawShowPlans, localData?.rawShowPlans),
              sdShowPlans: mergeShowPlans(cloudData.sdShowPlans, localData?.sdShowPlans),
              nxtShowPlans: mergeShowPlans(cloudData.nxtShowPlans, localData?.nxtShowPlans),
              customMatrices: (localData?.customMatrices && localData.customMatrices.length > 0) ? localData.customMatrices : (cloudData.customMatrices || []),
              ppvTimelines: (localData?.ppvTimelines && localData.ppvTimelines.length > 0) ? localData.ppvTimelines : (cloudData.ppvTimelines || []),
              matrixColumns: (localData?.matrixColumns && localData.matrixColumns.length > 0) ? localData.matrixColumns : (cloudData.matrixColumns || sampleFullData.matrixColumns)
            };

            setAppState(mergedState);
            safeSaveLocalStorage(STORAGE_KEY, mergedState);
            // Sync merged state back to Supabase
            saveToSupabase(mergedState).catch((err) => console.warn('Boot cloud sync notice:', err));
            console.log('Successfully hydrated and merged state on boot');
          }
        } catch (e) {
          console.warn('Cloud hydration notice:', e);
        }
      }
      isHydratedRef.current = true;
    }

    initCloudAndHydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  // Safe helper to save state to LocalStorage (safely strips heavy base64 strings if quota exceeded)
  function safeSaveLocalStorage(key: string, state: AppState) {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err: any) {
      console.warn('localStorage quota exceeded, stripping heavy base64 images:', err);
      try {
        const cleanedState = {
          ...state,
          champions: (state.champions || []).map((c) => ({
            ...c,
            wrestlerImage: c.wrestlerImage?.startsWith('data:image/') ? (c.currentChampion ? `/${encodeURIComponent(c.currentChampion)}.png` : '') : c.wrestlerImage,
            beltImage: c.beltImage?.startsWith('data:image/') ? '' : c.beltImage
          }))
        };
        localStorage.setItem(key, JSON.stringify(cleanedState));
      } catch (cleanErr) {
        console.warn('Final localStorage save notice:', cleanErr);
      }
    }
  }

  // Save state to LocalStorage and auto-sync to Supabase (after hydration is ready)
  useEffect(() => {
    safeSaveLocalStorage(STORAGE_KEY, appState);

    // NEVER auto-overwrite Supabase until initial mount cloud check is finished
    if (!isHydratedRef.current) {
      return;
    }

    // Debounce auto-save to Supabase to prevent empty/half-edited overwrites
    const timer = setTimeout(async () => {
      setIsCloudSyncing(true);
      try {
        await saveToSupabase(appState);
      } catch (err) {
        console.warn('Auto Supabase sync notice:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }, 1000);

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

  // Helpers to maintain alphabetical sorting (A to Z) across the entire application
  const sortSuperstarsAlphabetically = (list: Superstar[]): Superstar[] => {
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
  };

  const sortWomenTagTeamsAlphabetically = (list: WomenTagTeam[]): WomenTagTeam[] => {
    return [...list].sort((a, b) => a.teamName.localeCompare(b.teamName, undefined, { sensitivity: 'base', numeric: true }));
  };

  // Handlers for Superstars & Women Tag Teams (Fully Synced & Alphabetically Sorted)
  const handleAddSuperstar = (name: string, brand: BrandType, tier: TierType) => {
    const newId = `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSuperstar: Superstar = {
      id: newId,
      name,
      brand,
      tier
    };
    setAppState((prev) => {
      let updatedSuperstars = sortSuperstarsAlphabetically([...prev.superstars, newSuperstar]);
      let updatedWomenTag = prev.womenTagTeams || [];

      if (tier === 'Women Tag Team') {
        const newTeam: WomenTagTeam = {
          id: newId,
          teamName: name,
          brand
        };
        if (!updatedWomenTag.some((t) => t.teamName.toLowerCase() === name.toLowerCase())) {
          updatedWomenTag = sortWomenTagTeamsAlphabetically([...updatedWomenTag, newTeam]);
        }
      }

      return {
        ...prev,
        superstars: updatedSuperstars,
        womenTagTeams: updatedWomenTag
      };
    });
  };

  const handleUpdateSuperstarName = (id: string, name: string) => {
    setAppState((prev) => {
      const target = prev.superstars.find((s) => s.id === id);
      const oldName = target ? target.name : '';
      const updatedSuperstars = sortSuperstarsAlphabetically(
        prev.superstars.map((s) => (s.id === id ? { ...s, name } : s))
      );
      const updatedWomenTag = sortWomenTagTeamsAlphabetically(
        (prev.womenTagTeams || []).map((t) =>
          t.id === id || (oldName && t.teamName.toLowerCase() === oldName.toLowerCase()) ? { ...t, teamName: name } : t
        )
      );

      return {
        ...prev,
        superstars: updatedSuperstars,
        womenTagTeams: updatedWomenTag
      };
    });
  };

  const handleDeleteSuperstar = (id: string) => {
    setAppState((prev) => {
      const target = prev.superstars.find((s) => s.id === id);
      const oldName = target ? target.name : '';
      return {
        ...prev,
        superstars: prev.superstars.filter((s) => s.id !== id),
        womenTagTeams: (prev.womenTagTeams || []).filter(
          (t) => t.id !== id && (!oldName || t.teamName.toLowerCase() !== oldName.toLowerCase())
        )
      };
    });
  };

  const handleMoveSuperstar = (id: string, newBrand: BrandType, newTier: TierType) => {
    setAppState((prev) => {
      const target = prev.superstars.find((s) => s.id === id);
      const oldName = target ? target.name : '';
      let updatedSuperstars = sortSuperstarsAlphabetically(
        prev.superstars.map((s) => (s.id === id ? { ...s, brand: newBrand, tier: newTier } : s))
      );
      let updatedWomenTag = (prev.womenTagTeams || []).map((t) =>
        t.id === id || (oldName && t.teamName.toLowerCase() === oldName.toLowerCase()) ? { ...t, brand: newBrand } : t
      );

      if (newTier === 'Women Tag Team' && target) {
        if (!updatedWomenTag.some((t) => t.id === id || t.teamName.toLowerCase() === target.name.toLowerCase())) {
          updatedWomenTag.push({ id: target.id, teamName: target.name, brand: newBrand });
        }
      }

      return {
        ...prev,
        superstars: updatedSuperstars,
        womenTagTeams: sortWomenTagTeamsAlphabetically(updatedWomenTag)
      };
    });
  };

  // Handlers for Women Tag Teams
  const handleAddWomenTagTeam = (teamName: string) => {
    const newId = `wt-${Date.now()}`;
    const newTeam: WomenTagTeam = {
      id: newId,
      teamName,
      brand: 'RAW'
    };
    const newSuperstar: Superstar = {
      id: newId,
      name: teamName,
      brand: 'RAW',
      tier: 'Women Tag Team'
    };
    setAppState((prev) => ({
      ...prev,
      womenTagTeams: sortWomenTagTeamsAlphabetically([...(prev.womenTagTeams || []), newTeam]),
      superstars: sortSuperstarsAlphabetically([...prev.superstars, newSuperstar])
    }));
  };

  const handleUpdateWomenTagTeam = (id: string, teamName: string) => {
    setAppState((prev) => {
      const target = (prev.womenTagTeams || []).find((t) => t.id === id);
      const oldName = target ? target.teamName : '';
      return {
        ...prev,
        womenTagTeams: sortWomenTagTeamsAlphabetically(
          (prev.womenTagTeams || []).map((t) => (t.id === id ? { ...t, teamName } : t))
        ),
        superstars: sortSuperstarsAlphabetically(
          prev.superstars.map((s) =>
            s.id === id || (oldName && s.name.toLowerCase() === oldName.toLowerCase()) ? { ...s, name: teamName } : s
          )
        )
      };
    });
  };

  const handleDeleteWomenTagTeam = (id: string) => {
    setAppState((prev) => {
      const target = (prev.womenTagTeams || []).find((t) => t.id === id);
      const oldName = target ? target.teamName : '';
      return {
        ...prev,
        womenTagTeams: (prev.womenTagTeams || []).filter((t) => t.id !== id),
        superstars: prev.superstars.filter(
          (s) => s.id !== id && (!oldName || s.name.toLowerCase() !== oldName.toLowerCase())
        )
      };
    });
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

  const handleUpdateCalendarEvent = (event: CalendarEvent) => {
    setAppState((prev) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map((e) => (e.id === event.id ? event : e))
    }));
  };

  const handleToggleCalendarComplete = (id: string) => {
    setAppState((prev) => {
      const newEvents = prev.calendarEvents.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
      
      let currentYear = 2; // Default start year
      let latestCompletedYear = prev.universeTime?.year || 2;
      let latestCompletedMonth = prev.universeTime?.month || 'May';
      let latestCompletedWeek = prev.universeTime?.week || 'Day 1 (Start of Month - 0d)';
      
      let lastMonthIdx = 0; // 'May' is index 0
      let foundAnyCompleted = false;

      for (const event of newEvents) {
        const monthIdx = UNIVERSE_MONTH_ORDER.indexOf(event.month);
        // If month index drops (e.g. from December to January), we've crossed into a new year
        if (monthIdx < lastMonthIdx) {
          currentYear++;
        }
        lastMonthIdx = monthIdx >= 0 ? monthIdx : lastMonthIdx;
        
        if (event.isCompleted) {
          latestCompletedYear = currentYear;
          latestCompletedMonth = event.month;
          latestCompletedWeek = event.date;
          foundAnyCompleted = true;
        }
      }

      const newUniverseTime = foundAnyCompleted 
        ? { year: latestCompletedYear, month: latestCompletedMonth, week: latestCompletedWeek }
        : prev.universeTime; // Fallback to current if nothing is checked

      return {
        ...prev,
        calendarEvents: newEvents,
        universeTime: newUniverseTime
      };
    });
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

  const handleReorderChampions = (reorderedChampions: ChampionEntry[]) => {
    setAppState((prev) => ({
      ...prev,
      champions: reorderedChampions
    }));
  };

  // Handlers for Champion Archive
  const handleUpdateArchiveEntry = (entry: ArchiveEntry) => {
    setAppState((prev) => {
      const archive = prev.championArchive || [];
      const exists = archive.find(a => a.id === entry.id);
      if (exists) {
        return {
          ...prev,
          championArchive: archive.map((a) => (a.id === entry.id ? entry : a))
        };
      } else {
        return {
          ...prev,
          championArchive: [...archive, entry]
        };
      }
    });
  };

  const handleDeleteArchiveEntry = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      championArchive: (prev.championArchive || []).filter((a) => a.id !== id)
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

  const handleUpdateMatrix = (key: string, newMatrix: any[]) => {
    setAppState((prev) => {
      if (key === 'historyMatrix' || key === 'emptyMatrix') {
        return { ...prev, [key]: newMatrix };
      }
      if (prev.customMatrices) {
        return {
          ...prev,
          customMatrices: prev.customMatrices.map(cm => cm.id === key ? { ...cm, data: newMatrix } : cm)
        };
      }
      return prev;
    });
  };

  const handleAddCustomMatrix = (title: string) => {
    setAppState((prev) => {
      const template = prev.emptyMatrix && prev.emptyMatrix.length > 0 
        ? prev.emptyMatrix 
        : sampleFullData.emptyMatrix || [];
        
      const newCustom = {
        id: 'matrix-' + Date.now(),
        title,
        data: template.map((row: any) => ({ ...row, id: 'row-' + Date.now() + Math.random().toString(), champions: {} }))
      };
      
      return {
        ...prev,
        customMatrices: [...(prev.customMatrices || []), newCustom]
      };
    });
  };

  const handleDeleteCustomMatrix = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      customMatrices: (prev.customMatrices || []).filter(cm => cm.id !== id)
    }));
  };

  const handleAddPPVTimeline = (title?: string) => {
    setAppState((prev) => {
      const createBlankRows = () => 
        Array.from({ length: 15 }, (_, i) => ({
          id: `ppv-row-${Date.now()}-${i}`,
          rawSdEvent: '',
          rawSdMonth: '',
          rawSdDay: '',
          rawSdDaysCount: '',
          nxtEvent: '',
          nxtMonth: '',
          nxtDay: '',
          nxtDaysCount: '',
          colorPreset: 'default'
        }));

      const newTimeline = {
        id: 'ppv-tl-' + Date.now(),
        title: title || `PPV Schedule Timeline #${(prev.ppvTimelines?.length || 0) + 1}`,
        rows: createBlankRows()
      };

      return {
        ...prev,
        ppvTimelines: [...(prev.ppvTimelines || []), newTimeline]
      };
    });
  };

  const handleUpdatePPVTimeline = (timelineId: string, newRows: any[]) => {
    setAppState((prev) => ({
      ...prev,
      ppvTimelines: (prev.ppvTimelines || []).map((tl) => (tl.id === timelineId ? { ...tl, rows: newRows } : tl))
    }));
  };

  const handleDeletePPVTimeline = (timelineId: string) => {
    setAppState((prev) => ({
      ...prev,
      ppvTimelines: (prev.ppvTimelines || []).filter((tl) => tl.id !== timelineId)
    }));
  };

  const handleUpdateMatrixColumns = (newColumns: any[]) => {
    setAppState((prev) => ({
      ...prev,
      matrixColumns: newColumns
    }));
  };

  const handleUpdateTime = (time: any) => {
    setAppState((prev) => ({
      ...prev,
      universeTime: time
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
            womenTagTeams={appState.womenTagTeams}
            onAddSuperstar={handleAddSuperstar}
            onUpdateSuperstarName={handleUpdateSuperstarName}
            onDeleteSuperstar={handleDeleteSuperstar}
            onMoveSuperstar={handleMoveSuperstar}
            onSaveShowPlan={handleSaveShowPlan}
            onDeleteShowPlan={handleDeleteShowPlan}
            onAddChampion={handleAddChampion}
            onUpdateChampion={handleUpdateChampion}
            onDeleteChampion={handleDeleteChampion}
            onReorderChampions={handleReorderChampions}
            universeTime={appState.universeTime || { year: 2, month: 'May', week: 'Day 1 (Start of Month - 0d)' }}
            onUpdateTime={handleUpdateTime}
          />
        )}

        {currentTab === 'sd' && (
          <BrandDashboard
            brand="SmackDown"
            superstars={appState.superstars}
            champions={appState.champions}
            rivalries={appState.rivalries}
            showPlans={appState.sdShowPlans}
            womenTagTeams={appState.womenTagTeams}
            onAddSuperstar={handleAddSuperstar}
            onUpdateSuperstarName={handleUpdateSuperstarName}
            onDeleteSuperstar={handleDeleteSuperstar}
            onMoveSuperstar={handleMoveSuperstar}
            onSaveShowPlan={handleSaveShowPlan}
            onDeleteShowPlan={handleDeleteShowPlan}
            onAddChampion={handleAddChampion}
            onUpdateChampion={handleUpdateChampion}
            onDeleteChampion={handleDeleteChampion}
            onReorderChampions={handleReorderChampions}
            universeTime={appState.universeTime || { year: 2, month: 'May', week: 'Day 1 (Start of Month - 0d)' }}
            onUpdateTime={handleUpdateTime}
          />
        )}

        {currentTab === 'nxt' && (
          <BrandDashboard
            brand="NXT"
            superstars={appState.superstars}
            champions={appState.champions}
            rivalries={appState.rivalries}
            showPlans={appState.nxtShowPlans}
            womenTagTeams={appState.womenTagTeams}
            onAddSuperstar={handleAddSuperstar}
            onUpdateSuperstarName={handleUpdateSuperstarName}
            onDeleteSuperstar={handleDeleteSuperstar}
            onMoveSuperstar={handleMoveSuperstar}
            onSaveShowPlan={handleSaveShowPlan}
            onDeleteShowPlan={handleDeleteShowPlan}
            onAddChampion={handleAddChampion}
            onUpdateChampion={handleUpdateChampion}
            onDeleteChampion={handleDeleteChampion}
            onReorderChampions={handleReorderChampions}
            universeTime={appState.universeTime || { year: 2, month: 'May', week: 'Day 1 (Start of Month - 0d)' }}
            onUpdateTime={handleUpdateTime}
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
            onAddAchievement={handleAddAchievementFemale}
            onUpdateAchievement={handleUpdateAchievementFemale}
            onDeleteAchievement={handleDeleteAchievementFemale}
          />
        )}



        {currentTab === 'champ-list' && (
          <ChampListView
            archive={appState.championArchive || []}
            onUpdateArchiveEntry={handleUpdateArchiveEntry}
            onDeleteArchiveEntry={handleDeleteArchiveEntry}
          />
        )}

        {currentTab === 'summary' && (
          <SummaryView
            appState={appState}
            onLoadSampleData={handleLoadSampleData}
            onClearAllData={handleClearAllData}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onUpdateMatrix={handleUpdateMatrix}
            onUpdateMatrixColumns={handleUpdateMatrixColumns}
            onUpdateTime={handleUpdateTime}
            onAddCalendarEvent={handleAddCalendarEvent}
            onUpdateCalendarEvent={handleUpdateCalendarEvent}
            onToggleCalendarComplete={handleToggleCalendarComplete}
            onDeleteCalendarEvent={handleDeleteCalendarEvent}
            onAddCustomMatrix={handleAddCustomMatrix}
            onDeleteCustomMatrix={handleDeleteCustomMatrix}
            onAddPPVTimeline={handleAddPPVTimeline}
            onUpdatePPVTimeline={handleUpdatePPVTimeline}
            onDeletePPVTimeline={handleDeletePPVTimeline}
          />
        )}

      </main>
    </div>
  );
}
