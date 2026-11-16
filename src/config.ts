/* The site's database address and PUBLIC key.
   Both values are designed to be public: every visitor's browser receives them,
   and the database's own rules (supabase/schema.sql) decide what anyone may do.
   Never put a key starting with "sb_secret_" or the "service_role" key here.
   A .env file, if present, overrides these (see SETUP.md). */
export const SUPABASE_URL = 'https://qepfcdpxceefiusdimll.supabase.co'
export const SUPABASE_PUBLIC_KEY = 'sb_publishable_9pghMH90rzM2_ZboV2A-UQ_REgCxQrq'
