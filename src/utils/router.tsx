/* Tiny pushState router. No dependency, works with back/forward. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'

/* Two modes. Default: real paths with pushState (for a normal host).
   VITE_ROUTER=hash: plain "#name" hashes, for hosts that cannot serve deep
   links (previews, or GitHub Pages without a 404 redirect). */
const HASH_MODE = import.meta.env.VITE_ROUTER === 'hash'
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '').replace(/^\.$/, '') // "" or "/repo"

function readPath(): string {
  if (HASH_MODE) {
    const h = window.location.hash.replace(/^#/, '')
    return '/' + h.split('--').join('/')
  }
  let p = window.location.pathname
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length)
  if (!p.startsWith('/')) p = '/' + p
  return p.length > 1 ? p.replace(/\/$/, '') : p
}

/** Turn an app path ("/floor") into a real href that respects the base path. */
export function href(to: string): string {
  if (HASH_MODE) {
    const path = to.split('#')[0].replace(/^\//, '')
    return '#' + path.split('/').join('--')
  }
  return BASE + to
}

type Router = { path: string; search: string; navigate: (to: string) => void }
const Ctx = createContext<Router>({ path: '/', search: '', navigate: () => {} })

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState({ path: readPath(), search: window.location.search })

  useEffect(() => {
    const onPop = () => setLoc({ path: readPath(), search: window.location.search })
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [])

  const navigate = useCallback((to: string) => {
    if (HASH_MODE) window.location.hash = href(to)
    else window.history.pushState({}, '', href(to))
    setLoc({ path: readPath(), search: window.location.search })
    const hash = to.includes('#') ? to.slice(to.indexOf('#') + 1) : ''
    if (hash) {
      // wait for the new page to mount, then jump to the anchor
      window.setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 260)
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [])

  const value = useMemo(() => ({ ...loc, navigate }), [loc, navigate])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRouter() {
  return useContext(Ctx)
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter()
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={href(to)} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
