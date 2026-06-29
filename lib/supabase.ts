import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

// Browser / client-side singleton
let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient<Database>(supabaseUrl, supabaseAnon);
  }
  return _client;
}

// Convenience re-export used throughout the app
export const supabase = {
  get client() { return getSupabaseClient(); },
};
