import { useEffect, useState } from 'react'
import { LayoutDashboard, Menu, Search, X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_CALM, EASE_SNAP, InkProgress, motion, useReducedMotion } from '../utils/motion'
import { Link, useRouter } from '../utils/router'
import { useSession } from '../services/session'
import { OPEN_SEARCH } from './Search'

/* Main nav: five items, no more. About lives in the footer only. */
export const NAV = [
  { to: '/articles', label: 'Articles' },
  { to: '/resources', label: 'Resources' },
  { to: '/motions', label: 'Motions' },
  { to: '/floor', label: 'The Floor' },
  { to: '/glossary', label: 'Glossary' },
] as const

export function Brand({ compact = false, stacked = false }: { compact?: boolean; stacked?: boolean }) {
  if (stacked)
    return (
      <span className="inline-flex flex-col items-center text-center">
        <span className="urdu text-5xl leading-[1.2] font-bold text-oxblood">رمزِ فکر</span>
        <span className="font-display text-base font-bold tracking-[0.3em] text-oxblood">RAMZ-E-FIKR</span>
      </span>
    )
  return (
    <span className="flex items-center gap-2.5 whitespace-nowrap">
      {/* the monogram tile: the same mark as the browser tab icon */}
      <span aria-hidden="true" className="seal relative grid h-9 w-9 shrink-0 place-items-center bg-oxblood">
        <span className="absolute inset-[3px] border border-gold/80" />
        <span className="urdu text-xl leading-none text-ivory">ف</span>
      </span>
      <span className={`urdu font-bold text-oxblood ${compact ? 'text-2xl' : 'text-[1.75rem]'}`}>رمزِ فکر</span>
      <span className="hidden font-display text-[0.8125rem] font-bold tracking-[0.22em] text-oxblood min-[400px]:inline md:text-sm">RAMZ-E-FIKR</span>
    </span>
  )
}

export default function Navbar() {
  const { path } = useRouter()
  const { user, ready } = useSession()
  const reduced = !!useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [path])

  const isActive = (to: string) => path === to || path.startsWith(to + '/')

  return (
    <>
      {/* masthead line, like the top of a newspaper. Scrolls away; the header below stays. */}
      <div className="bg-oxblood text-ivory">
        <div className="wrap flex h-8 items-center justify-between gap-4 font-mono text-[0.6875rem] tracking-[0.16em] uppercase">
          <span>Where thought becomes argument</span>
          <span className="hidden sm:inline">Vol. I · 2026 · Lahore · Faisalabad</span>
        </div>
      </div>
    <header className="sticky top-0 z-40 bg-ivory">
      <div className="wrap flex h-16 items-center gap-3 md:h-[4.5rem]">
        <motion.div
          className="origin-left"
          animate={{ scale: scrolled && !reduced ? 0.92 : 1 }}
          transition={{ duration: DUR.base, ease: EASE_CALM }}
        >
          <Link to="/" aria-label="Ramz-e-Fikr home" className="block py-2">
            <Brand compact />
          </Link>
        </motion.div>

        {user && (
          <Link
            to="/dashboard"
            className="ml-1 inline-flex min-h-11 items-center gap-1.5 border border-oxblood px-2.5 text-[0.8125rem] font-bold text-oxblood transition-transform duration-200 hover:-translate-y-px md:px-3"
          >
            <LayoutDashboard size={15} aria-hidden="true" />
            <span className="hidden min-[430px]:inline">My Dashboard</span>
            <span className="min-[430px]:hidden">Dashboard</span>
          </Link>
        )}

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={isActive(n.to) ? 'page' : undefined}
              className={`relative px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-200 ${
                isActive(n.to) ? 'text-oxblood' : 'text-ink hover:text-oxblood'
              }`}
            >
              {n.label}
              {isActive(n.to) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-oxblood"
                  transition={{ duration: DUR.slow, ease: EASE_SNAP }}
                />
              )}
            </Link>
          ))}
          {!user && ready && (
            <Link to="/signin" className="btn btn-ghost ml-3 !min-h-10 !py-1.5 text-sm">
              Sign in
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH))}
          aria-label="Search the archive (Ctrl+K)"
          title="Search (Ctrl+K)"
          className="ml-auto grid h-11 w-11 place-items-center text-ink hover:text-oxblood lg:ml-1"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* hairline appears once the page scrolls */}
      <div
        className="h-px bg-ink transition-opacity duration-300"
        style={{ opacity: scrolled ? 0.8 : 0.18 }}
        aria-hidden="true"
      />

      <InkProgress className="absolute inset-x-0 bottom-0 h-[3px] bg-oxblood" />

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Main"
            className="absolute inset-x-0 top-full border-b border-ink bg-ivory shadow-[0_8px_0_rgba(23,23,23,0.06)] lg:hidden"
            initial={{ opacity: 0, y: reduced ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: DUR.fast, ease: EASE_CALM }}
          >
            <ul className="wrap py-2">
              {NAV.map((n) => (
                <li key={n.to} className="border-b border-border-warm last:border-0">
                  <Link
                    to={n.to}
                    aria-current={isActive(n.to) ? 'page' : undefined}
                    className={`flex min-h-12 items-center justify-between font-display text-lg font-bold ${
                      isActive(n.to) ? 'text-oxblood' : ''
                    }`}
                  >
                    {n.label}
                    <span aria-hidden="true" className="arrow text-gold">
                      ⟶
                    </span>
                  </Link>
                </li>
              ))}
              {!user && ready && (
                <li className="py-3">
                  <Link to="/signin" className="btn btn-primary w-full">
                    Sign in or create account
                  </Link>
                </li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
    </>
  )
}
