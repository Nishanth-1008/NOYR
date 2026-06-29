import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Server-only Supabase client that uses the service role key.
 * Never import this from client components.
 */
export function getSupabaseAdmin() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
