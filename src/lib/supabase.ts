import { createClient } from '@supabase/supabase-js';
import { AppState, Superstar } from '../types';

const getEnv = (key: string) => {
  try {
    return (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env[key] : process.env[key]);
  } catch {
    return process.env[key];
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://ktitkqrusecvnuuulurf.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_17GLKGxmlx8j9vhPaAbaqQ_Max4lhD5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_TABLE_NAME = 'wwe_universe_data';
export const SUPABASE_ROW_ID = 'main_save';

// Helper to save Universe data to Supabase (saves to wwe_universe_data AND all relational tables)
export async function saveToSupabase(data: AppState): Promise<{ success: boolean; error?: any }> {
  try {
    // 1. Save full JSON state to wwe_universe_data table (Primary Source of Truth)
    const cleanData = JSON.parse(JSON.stringify(data));
    const { error: mainError } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .upsert({
        id: SUPABASE_ROW_ID,
        data: cleanData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (mainError) {
      console.warn('Supabase save notice (wwe_universe_data):', mainError.message || mainError.details || mainError);
      return { success: false, error: mainError };
    }

    // 2. Non-blocking secondary sync to relational tables (for SQL Editor views)
    (async () => {
      try {
        if (Array.isArray(data.superstars) && data.superstars.length > 0) {
          const formattedSuperstars = data.superstars.map((s) => ({
            id: s.id,
            name: s.name,
            brand: s.brand,
            tier: s.tier,
            overall_rating: s.overallRating || 85,
            title_held: s.titleHeld || null,
            notes: s.notes || null
          }));
          await supabase.from('superstars').upsert(formattedSuperstars, { onConflict: 'id' });
        }

        if (Array.isArray(data.champions) && data.champions.length > 0) {
          const formattedChamps = data.champions.map((c) => ({
            id: c.id,
            title_name: c.titleName,
            brand: c.brand,
            current_champion: c.currentChampion,
            days_held: c.daysHeld || 0,
            defenses: c.defenses || 0,
            previous_champion: c.previousChampion || null,
            acquired_date: c.acquiredDate || null,
            wrestler_image: c.wrestlerImage || null,
            belt_image: c.beltImage || null
          }));
          await supabase.from('champions').upsert(formattedChamps, { onConflict: 'id' });
        }

        if (Array.isArray(data.calendarEvents) && data.calendarEvents.length > 0) {
          const formattedEvents = data.calendarEvents.map((ev) => ({
            id: ev.id,
            title: ev.eventName,
            month: ev.month,
            date_str: ev.date,
            type: ev.type === 'PLE' ? 'PPV' : ev.type,
            brand: ev.brand,
            arena: ev.location || null,
            main_event: ev.mainEvent || null
          }));
          await supabase.from('calendar_events').upsert(formattedEvents, { onConflict: 'id' });
        }

        if (Array.isArray(data.rivalries) && data.rivalries.length > 0) {
          const formattedRivalries = data.rivalries.map((r) => ({
            id: r.id,
            name: r.name || `${r.rival1} vs ${r.rival2}`,
            brand: r.brand,
            rival1: r.rival1,
            rival2: r.rival2,
            intensity: r.intensity || 'Medium',
            rivalry_type: r.type || '1v1',
            current_stage: r.currentStage || null,
            winner: r.winner || null,
            notes: r.notes || null
          }));
          await supabase.from('rivalries').upsert(formattedRivalries, { onConflict: 'id' });
        }

        if (Array.isArray(data.womenTagTeams) && data.womenTagTeams.length > 0) {
          const formattedTagTeams = data.womenTagTeams.map((wt) => ({
            id: wt.id,
            team_name: wt.teamName,
            brand: wt.brand || 'RAW',
            notes: wt.notes || null
          }));
          await supabase.from('women_tag_teams').upsert(formattedTagTeams, { onConflict: 'id' });
        }

        if (Array.isArray(data.achievementsMen) && data.achievementsMen.length > 0) {
          const formattedMen = data.achievementsMen.map((am) => {
            const rr = am.royalRumbleCount ?? (am.royalRumble ? 1 : 0);
            const mb = am.mitbCount ?? (am.mitb ? 1 : 0);
            return {
              id: am.id,
              superstar_name: am.superstarName,
              brand: am.brand || 'Joint',
              univ_undisputed: am.univUndisputed || false,
              world_hw: am.worldHw || false,
              ic: am.ic || false,
              us: am.us || false,
              tag_team: am.tagTeam || false,
              cruiserweight: am.cruiserweight || false,
              nxt: am.nxt || false,
              uk: am.uk || false,
              north_american: am.northAmerican || false,
              royal_rumble_count: rr,
              mitb_count: mb,
              chamber_count: am.chamberCount || 0,
              grand_slam_order: am.grandSlamOrder || null,
              notes: am.notes || null
            };
          });
          await supabase.from('achievements_men').upsert(formattedMen, { onConflict: 'id' });
        }

        if (Array.isArray(data.achievementsWomen) && data.achievementsWomen.length > 0) {
          const formattedWomen = data.achievementsWomen.map((aw) => {
            const rr = aw.royalRumbleCount ?? (aw.royalRumble ? 1 : 0);
            const mb = aw.mitbCount ?? (aw.mitb ? 1 : 0);
            return {
              id: aw.id,
              superstar_name: aw.superstarName,
              brand: aw.brand || 'Joint',
              royal_rumble_count: rr,
              mitb_count: mb,
              chamber_count: aw.chamberCount || 0,
              grand_slam: aw.grandSlam || false,
              rivalry_of_year_count: aw.rivalryOfYearCount || 0,
              title_reigns_count: aw.titleReignsCount || 0,
              notes: aw.notes || null
            };
          });
          await supabase.from('achievements_women').upsert(formattedWomen, { onConflict: 'id' });
        }

        if (Array.isArray(data.championArchive) && data.championArchive.length > 0) {
          const formattedArchive = data.championArchive.map((ca) => ({
            id: ca.id,
            title_name: ca.titleName,
            brand: ca.brand,
            current_champion: ca.currentChampion,
            days_held: ca.daysHeld || 0,
            defenses: ca.defenses || 0,
            previous_champion: ca.previousChampion || null,
            acquired_date: ca.acquiredDate || null,
            wrestler_image: ca.wrestlerImage || null,
            belt_image: ca.beltImage || null,
            notes: ca.notes || null
          }));
          await supabase.from('champion_archive').upsert(formattedArchive, { onConflict: 'id' });
        }
      } catch (secErr) {
        console.warn('Background relational sync notice:', secErr);
      }
    })();

    return { success: true };
  } catch (err) {
    console.error('Supabase save exception:', err);
    return { success: false, error: err };
  }
}

// Helper to load Universe data from Supabase
export async function loadFromSupabase(): Promise<{ success: boolean; data?: AppState; error?: any }> {
  try {
    // 1. Try loading from wwe_universe_data main save
    const { data: mainRow, error: mainError } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select('data')
      .eq('id', SUPABASE_ROW_ID)
      .single();

    let state: AppState | null = mainRow && mainRow.data ? (mainRow.data as AppState) : null;
    
    // If we successfully loaded the full JSON state, return it immediately!
    if (state) {
      return { success: true, data: state };
    }

    // 2. Also check if 'superstars' relational table has rows (Fallback if JSON fails)
    const { data: superstarsRows } = await supabase.from('superstars').select('*');
    if (superstarsRows && superstarsRows.length > 0) {
      const mappedSuperstars: Superstar[] = superstarsRows.map((row: any) => ({
        id: row.id,
        name: row.name,
        brand: row.brand as any,
        tier: row.tier as any,
        overallRating: row.overall_rating,
        titleHeld: row.title_held,
        notes: row.notes
      }));

      if (!state) {
        state = {
          superstars: mappedSuperstars,
          womenTagTeams: [],
          achievementsMen: [],
          achievementsWomen: [],
          calendarEvents: [],
          champions: [],
          rivalries: [],
          rawShowPlans: [],
          sdShowPlans: [],
          nxtShowPlans: [],
          championArchive: []
        };
      } else {
        state.superstars = mappedSuperstars;
      }
    }

    // 3. Load from relational 'champions' table if populated
    if (state) {
      const { data: champsRows } = await supabase.from('champions').select('*');
      if (champsRows && champsRows.length > 0) {
        state.champions = champsRows.map((r: any) => ({
          id: r.id,
          titleName: r.title_name,
          brand: r.brand as any,
          currentChampion: r.current_champion,
          daysHeld: r.days_held || 0,
          defenses: r.defenses || 0,
          previousChampion: r.previous_champion || undefined,
          acquiredDate: r.acquired_date || undefined,
          wrestlerImage: r.wrestler_image || r.wrestlerImage || undefined,
          beltImage: r.belt_image || r.beltImage || undefined
        }));
      }

      // 4. Load from relational 'calendar_events' table if populated
      const { data: eventsRows } = await supabase.from('calendar_events').select('*');
      if (eventsRows && eventsRows.length > 0) {
        state.calendarEvents = eventsRows.map((r: any) => ({
          id: r.id,
          month: r.month || 'January',
          eventName: r.title,
          brand: r.brand,
          type: (r.type === 'PPV' ? 'PLE' : r.type) as any,
          date: r.date_str || '',
          location: r.arena || undefined,
          mainEvent: r.main_event || undefined,
          isCompleted: false
        }));
      }

      // 5. Load from relational 'rivalries' table if populated
      const { data: rivRows } = await supabase.from('rivalries').select('*');
      if (rivRows && rivRows.length > 0) {
        state.rivalries = rivRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          brand: r.brand as any,
          rival1: r.rival1,
          rival2: r.rival2,
          intensity: r.intensity as any,
          type: r.rivalry_type as any,
          currentStage: r.current_stage as any,
          winner: r.winner || undefined,
          notes: r.notes || undefined
        }));
      }

      // 6. Load from relational 'women_tag_teams' table if populated
      const { data: wtRows } = await supabase.from('women_tag_teams').select('*');
      if (wtRows && wtRows.length > 0) {
        state.womenTagTeams = wtRows.map((r: any) => ({
          id: r.id,
          teamName: r.team_name,
          brand: (r.brand || 'RAW') as any,
          notes: r.notes || undefined
        }));
      }

      // 7. Load from relational 'achievements_men' table if populated
      const { data: amRows, error: amLoadError } = await supabase.from('achievements_men').select('*');
      if (amRows && amRows.length > 0 && !amLoadError) {
        state.achievementsMen = amRows.map((r: any) => {
          const rr = r.royal_rumble_count ?? r.royalRumbleCount ?? (r.royal_rumble || r.royalRumble ? 1 : 0);
          const mb = r.mitb_count ?? r.mitbCount ?? (r.mitb ? 1 : 0);
          return {
            id: r.id,
            superstarName: r.superstar_name || r.superstarName,
            brand: (r.brand || 'Joint') as any,
            univUndisputed: r.univ_undisputed || r.univUndisputed || false,
            worldHw: r.world_hw || r.worldHw || false,
            ic: r.ic || false,
            us: r.us || false,
            tagTeam: r.tag_team || r.tagTeam || false,
            cruiserweight: r.cruiserweight || false,
            nxt: r.nxt || false,
            uk: r.uk || false,
            northAmerican: r.north_american || r.northAmerican || false,
            royalRumbleCount: rr,
            mitbCount: mb,
            royalRumble: rr > 0,
            mitb: mb > 0,
            grandSlamOrder: r.grand_slam_order || r.grandSlamOrder || undefined,
            notes: r.notes || undefined
          };
        });
      }

      // 8. Load from relational 'achievements_women' table if populated
      const { data: awRows, error: awLoadError } = await supabase.from('achievements_women').select('*');
      if (awRows && awRows.length > 0 && !awLoadError) {
        state.achievementsWomen = awRows.map((r: any) => {
          const rr = r.royal_rumble_count ?? r.royalRumbleCount ?? (r.royal_rumble || r.royalRumble ? 1 : 0);
          const mb = r.mitb_count ?? r.mitbCount ?? (r.mitb ? 1 : 0);
          return {
            id: r.id,
            superstarName: r.superstar_name || r.superstarName,
            brand: (r.brand || 'Joint') as any,
            royalRumbleCount: rr,
            mitbCount: mb,
            royalRumble: rr > 0,
            mitb: mb > 0,
            chamberCount: r.chamber_count || r.chamberCount || 0,
            grandSlam: r.grand_slam || r.grandSlam || false,
            rivalryOfYearCount: r.rivalry_of_year_count || r.rivalryOfYearCount || 0,
            titleReignsCount: r.title_reigns_count || r.titleReignsCount || 0,
            notes: r.notes || undefined
          };
        });
      }

      // 9. Load from relational 'champion_archive' table if populated
      const { data: caRows } = await supabase.from('champion_archive').select('*');
      if (caRows && caRows.length > 0) {
        state.championArchive = caRows.map((r: any) => ({
          id: r.id,
          titleName: r.title_name || r.titleName,
          brand: r.brand,
          currentChampion: r.current_champion || r.currentChampion,
          daysHeld: r.days_held || r.daysHeld || 0,
          defenses: r.defenses || 0,
          previousChampion: r.previous_champion || r.previousChampion || undefined,
          acquiredDate: r.acquired_date || r.acquiredDate || undefined,
          wrestlerImage: r.wrestler_image || r.wrestlerImage || undefined,
          beltImage: r.belt_image || r.beltImage || undefined,
          notes: r.notes || undefined
        }));
      }
    }

    if (state) {
      return { success: true, data: state };
    }
    return { success: false, error: 'No data found in Supabase' };
  } catch (err) {
    console.error('Supabase load exception:', err);
    return { success: false, error: err };
  }
}

// Helper to check Supabase connection status
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { status, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase connection check warning:', error);
      return false;
    }
    return status >= 200 && status < 300;
  } catch (err) {
    console.error('Supabase connection check exception:', err);
    return false;
  }
}
