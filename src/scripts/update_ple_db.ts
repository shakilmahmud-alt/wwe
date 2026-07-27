import { loadFromSupabase, saveToSupabase } from '../lib/supabase';
import { sampleFullData } from '../data/sampleRoster';

async function main() {
  console.log('Loading existing data from Supabase...');
  const res = await loadFromSupabase();
  
  const dataToSave = res.success && res.data ? res.data : sampleFullData;
  console.log(`Syncing ALL dataset categories (superstars, champions, PLE schedule, rivalries, tag teams, show plans, and 203 achievement superstars) to Supabase relational tables and main save...`);

  dataToSave.superstars = sampleFullData.superstars;
  dataToSave.calendarEvents = sampleFullData.calendarEvents;
  dataToSave.champions = sampleFullData.champions;
  dataToSave.achievementsMen = sampleFullData.achievementsMen;
  dataToSave.rivalries = sampleFullData.rivalries;
  dataToSave.womenTagTeams = sampleFullData.womenTagTeams;
  dataToSave.rawShowPlans = sampleFullData.rawShowPlans;
  dataToSave.sdShowPlans = sampleFullData.sdShowPlans;
  dataToSave.nxtShowPlans = sampleFullData.nxtShowPlans;

  const saveRes = await saveToSupabase(dataToSave);
  if (saveRes.success) {
    console.log('✅ SUCCESSFULLY SYNCED ALL RELATIONAL TABLES IN SUPABASE!');
    console.log('-> superstars table: SYNCED');
    console.log('-> champions & championships tables: SYNCED');
    console.log('-> calendar_events table: SYNCED');
    console.log('-> rivalries table: SYNCED');
    console.log('-> women_tag_teams table: SYNCED');
    console.log('-> show_plans table: SYNCED');
    console.log('-> wwe_universe_data (main save): SYNCED');
  } else {
    console.error('❌ Failed to save to Supabase:', saveRes.error);
  }
}

main().catch(console.error);
