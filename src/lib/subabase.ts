import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';


console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        // use AsyncStorage in place of localStorage
        storage: AsyncStorage,
  
        // auto-persist sessions to storage
        persistSession: true,
  
        // auto-refresh your token when it's about to expire
        autoRefreshToken: true,
  
        // React Native has no URL to detect, so disable
        detectSessionInUrl: false,
      }
    }
  );

export async function saveLetterboxdUsername(userId: string, username: string) {
  // Assumes you have a table 'letterboxd_users' with columns 'user_id' and 'username'
  return supabase.from('connected_accounts').upsert([
    { user_id: userId, provider: 'letterboxd', provider_uid: username}
  ]);
}

export async function getLetterboxdUsername(userId: string) {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('provider_uid')
    .eq('user_id', userId)
    .eq('provider', 'letterboxd')
    .single();
  if (error) throw error;
  return data?.provider_uid ?? null;
}

export async function saveLetterboxdRawImport(userId: string, data: object) {
  // Assumes you have a table 'raw_imports' with columns 'user_id', 'provider', and 'data'
  return supabase.from('raw_imports').upsert([
    { user_id: userId, provider: 'letterboxd', data }
  ]);
}

export async function getLetterboxdRawImport(userId: string) {
  const { data, error } = await supabase
    .from('raw_imports')
    .select('data')
    .eq('user_id', userId)
    .eq('provider', 'letterboxd')
    .single();
  if (error) throw error;
  return data?.data ?? null;
}