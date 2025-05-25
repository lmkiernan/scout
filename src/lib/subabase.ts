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
  return supabase.from('letterboxd_users').upsert([
    { user_id: userId, username }
  ]);
}