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

export async function saveMovieSuggestion(userId: string, title: string, reason: string) {
  // Assumes you have a table 'movie_suggestions' with columns 'user_id', 'title', and 'reason'
  return supabase.from('movie_suggestions').insert([
    { user_id: userId, title, reason }
  ]);
}

export async function getFirstMovieSuggestion(userId: string) {
  const { data, error } = await supabase
    .from('movie_suggestions')
    .select('title, reason')
    .eq('user_id', userId)
    .order('id', { ascending: true }) // or 'created_at' if you prefer
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllMovieSuggestions(userId: string) {
  const { data, error } = await supabase
    .from('movie_suggestions')
    .select('title, reason')
    .eq('user_id', userId)
    .order('id', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Check if a movie exists by title
export async function getMovieByTitle(title: string) {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('title', title)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
}

// Add a new movie
export async function addMovie({ title, posterUrl }: { title: string, posterUrl: string }) {
  const { data, error } = await supabase
    .from('movies')
    .insert([{ title, poster: posterUrl }])
    .single();
  if (error) throw error;
  return data;
}