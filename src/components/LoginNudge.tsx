/* A small, dismissible note for signed-out visitors. Once per session,
   never on /about, never covering the page. Bottom sheet on phones. */
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion, useReducedMotion } from '../utils/motion'
import { Link, useRouter } from '../utils/router'
import { useSession } from '../services/session'

const KEY = 'ramz.nudge-seen'

export default function LoginNudge() {
  const { user } = useSession()
  const { path } = useRouter()
  const reduced = !!useReducedMotion()
  const [show, setShow] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = window.sessionStorage.getItem(KEY) === '1'
    } catch {
      /* ignore */
    }
    if (seen || user) return
    const t = window.setTimeout(() => setShow(true), 7000)
    return () => window.clearTimeout(t)
  }, [user])

  const close = () => {
    setShow(false)
    try {
      window.sessionStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
  }
  const visible = show && !user && path !== '/about' && path !== '/signin'

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Join the discussion"
          className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-parchment p-4 pr-14 shadow-[0_-6px_0_rgba(23,23,23,0.06)] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-80 sm:border sm:border-ink sm:shadow-[4px_5px_0_rgba(23,23,23,0.1)]"
          initial={{ opacity: 0, y: reduced ? 0 : 30, rotate: reduced ? 0 : 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 20 }}
          transition={{ duration: DUR.slow, ease: EASE_SNAP }}
        >
          <p className="text-[0.9375rem]">
            <Link to="/signin" onClick={close} className="font-bold text-oxblood underline underline-offset-2">
              Log in
            </Link>{' '}
            to join the discussion, or explore the{' '}
            <Link to="/about#guide" onClick={close} className="font-bold text-link-blue underline underline-offset-2">
              user guide
            </Link>
            .
          </p>
          <button type="button" onClick={close} aria-label="Dismiss" className="absolute top-1 right-1 grid h-11 w-11 place-items-center">
            <X size={18} />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
