/* The database connection. It only exists when both public values are set
   in .env (see SETUP.md). Without them the site runs in local preview mode.
   Only the project URL and the public "anon" key belong here. Never put the
   service_role key anywhere in this project. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

/** true when the site is talking to the real database */
export const CONNECTED = supabase !== null
