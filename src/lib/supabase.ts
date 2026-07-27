import { createClient } from '@supabase/supabase-js';
import { AppState } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ktitkqrusecvnuuulurf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_17GLKGxmlx8j9vhPaAbaqQ_Max4lhD5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_TABLE_NAME = 'wwe_universe_data';
export const SUPABASE_ROW_ID = 'main_save';

// Helper to save Universe data to Supabase
export async function saveToSupabase(data: AppState): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .upsert({
        id: SUPABASE_ROW_ID,
        data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase save error:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('Supabase save exception:', err);
    return { success: false, error: err };
  }
}

// Helper to load Universe data from Supabase
export async function loadFromSupabase(): Promise<{ success: boolean; data?: AppState; error?: any }> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select('data')
      .eq('id', SUPABASE_ROW_ID)
      .single();

    if (error) {
      console.error('Supabase load error:', error);
      return { success: false, error };
    }

    if (data && data.data) {
      return { success: true, data: data.data as AppState };
    }
    return { success: false, error: 'No data found in Supabase' };
  } catch (err) {
    console.error('Supabase load exception:', err);
    return { success: false, error: err };
  }
}
