/* The database connection. It only exists when both public values are set
   in .env (see SETUP.md). Without them the site runs in local preview mode.
   Only the project URL and the public "anon" key belong here. Never put the
   service_role key anywhere in this project. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from '../config'

// "off" in .env forces local preview mode, e.g. VITE_SUPABASE_URL=off
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const envKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined)?.trim()
const url = envUrl === 'off' ? '' : envUrl || SUPABASE_URL
const key = envUrl === 'off' ? '' : envKey || SUPABASE_PUBLIC_KEY

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

/** true when the site is talking to the real database */
export const CONNECTED = supabase !== null
