/* Who is signed in.
   Connected mode: real accounts through Supabase (a code sent by email);
   the role comes from the database and cannot be changed from the browser.
   Local preview mode (no keys in .env): pick a role to see how the site
   changes. Nothing in preview mode grants real permissions. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CONNECTED, supabase } from './supabase'
import { hydrate } from './store'

export type Role = 'member' | 'editor' | 'owner'
export type SessionUser = { id: string; name: string; role: Role }

const KEY = 'ramz.preview-session'

function loadPreview(): SessionUser | null {
  if (CONNECTED) return null
  try {
    const raw = window.localStorage.getItem(KEY)
    const u = raw ? (JSON.parse(raw) as SessionUser) : null
    return u ? { ...u, id: u.id ?? 'preview-' + u.role } : null
  } catch {
    return null
  }
}

type Result = { ok: true } | { ok: false; message: string }
type Session = {
  user: SessionUser | null
  /** false until we know whether someone is signed in */
  ready: boolean
  connected: boolean
  signInPreview: (role: Role) => void
  sendCode: (email: string, displayName: string) => Promise<Result>
  verifyCode: (email: string, code: string) => Promise<Result>
  signOut: () => void
}

const noop = async (): Promise<Result> => ({ ok: false, message: 'Not connected to a database.' })
const Ctx = createContext<Session>({
  user: null,
  ready: true,
  connected: false,
  signInPreview: () => {},
  sendCode: noop,
  verifyCode: noop,
  signOut: () => {},
})

async function loadProfile(id: string): Promise<SessionUser | null> {
  if (!supabase) return null
  const { data } = await supabase.from('profiles').select('display_name, role').eq('id', id).maybeSingle()
  return data ? { id, name: data.display_name as string, role: data.role as Role } : null
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(loadPreview)
  const [ready, setReady] = useState(!CONNECTED)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    const apply = async (uid: string | undefined) => {
      const u = uid ? await loadProfile(uid) : null
      if (!alive) return
      setUser(u)
      setReady(true)
      void hydrate(u?.id ?? null)
    }
    void supabase.auth.getSession().then(({ data }) => apply(data.session?.user.id))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // defer: Supabase asks that no other Supabase call runs inside this callback
      window.setTimeout(() => void apply(session?.user.id), 0)
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInPreview = useCallback((role: Role) => {
    if (CONNECTED) return
    const u: SessionUser = { id: 'preview-' + role, name: `Preview ${role}`, role }
    setUser(u)
    try {
      window.localStorage.setItem(KEY, JSON.stringify(u))
    } catch {
      /* storage unavailable: session lasts until reload */
    }
  }, [])

  const sendCode = useCallback(async (email: string, displayName: string): Promise<Result> => {
    if (!supabase) return noop()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { display_name: displayName }, emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    return error ? { ok: false, message: error.message } : { ok: true }
  }, [])

  const verifyCode = useCallback(async (email: string, code: string): Promise<Result> => {
    if (!supabase) return noop()
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    return error ? { ok: false, message: error.message } : { ok: true }
  }, [])

  const signOut = useCallback(() => {
    if (supabase) {
      void supabase.auth.signOut()
      return
    }
    setUser(null)
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ user, ready, connected: CONNECTED, signInPreview, sendCode, verifyCode, signOut }),
    [user, ready, signInPreview, sendCode, verifyCode, signOut],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession() {
  return useContext(Ctx)
}
