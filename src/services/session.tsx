/* Session state. In local preview mode (no Supabase keys) you can sign in
   as any role to see how the site changes. Real auth and database-enforced
   roles arrive with the accounts phase; nothing here grants real permissions. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type Role = 'member' | 'editor' | 'owner'
export type SessionUser = { name: string; role: Role }

const KEY = 'ramz.preview-session'

function load(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

type Session = {
  user: SessionUser | null
  signInPreview: (role: Role) => void
  signOut: () => void
}

const Ctx = createContext<Session>({ user: null, signInPreview: () => {}, signOut: () => {} })

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(load)

  const signInPreview = useCallback((role: Role) => {
    const u: SessionUser = { name: `Preview ${role}`, role }
    setUser(u)
    try {
      window.localStorage.setItem(KEY, JSON.stringify(u))
    } catch {
      /* storage unavailable: session lasts until reload */
    }
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => ({ user, signInPreview, signOut }), [user, signInPreview, signOut])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession() {
  return useContext(Ctx)
}
