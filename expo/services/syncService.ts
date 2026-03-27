import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseDB } from '@/services/supabase';
import { isConfigured } from '@/constants/config';

const SYNC_KEY = 'last_sync_timestamp';

// Sync user app state to Supabase
// Table: user_app_state (needs to be created in Supabase dashboard)
//
// SQL para criar a tabela no Supabase:
//
// CREATE TABLE user_app_state (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
//   app_state JSONB NOT NULL DEFAULT '{}',
//   updated_at TIMESTAMPTZ DEFAULT now()
// );
//
// ALTER TABLE user_app_state ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "Users can read own state"
//   ON user_app_state FOR SELECT
//   USING (auth.uid() = user_id);
//
// CREATE POLICY "Users can insert own state"
//   ON user_app_state FOR INSERT
//   WITH CHECK (auth.uid() = user_id);
//
// CREATE POLICY "Users can update own state"
//   ON user_app_state FOR UPDATE
//   USING (auth.uid() = user_id);

export async function syncStateToCloud(userId: string, appState: Record<string, unknown>): Promise<{ error: string | null }> {
  if (!isConfigured.supabase) {
    return { error: null }; // Silently skip if not configured
  }

  try {
    const { error } = await supabaseDB.upsert('user_app_state', {
      user_id: userId,
      app_state: appState,
      updated_at: new Date().toISOString(),
    }, 'user_id');

    if (!error) {
      await AsyncStorage.setItem(SYNC_KEY, new Date().toISOString());
    }

    return { error };
  } catch {
    return { error: 'Erro ao sincronizar' };
  }
}

export async function loadStateFromCloud(userId: string): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  if (!isConfigured.supabase) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabaseDB.select<{ app_state: Record<string, unknown> }>(
      'user_app_state',
      `user_id=eq.${userId}&select=app_state`
    );

    if (error) {
      return { data: null, error };
    }

    if (data && data.length > 0) {
      return { data: data[0].app_state, error: null };
    }

    return { data: null, error: null };
  } catch {
    return { data: null, error: 'Erro ao carregar dados da nuvem' };
  }
}

export async function getLastSyncTime(): Promise<string | null> {
  return AsyncStorage.getItem(SYNC_KEY);
}
