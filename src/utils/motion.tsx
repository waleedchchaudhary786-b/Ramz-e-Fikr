/* ------------------------------------------------------------------
   THE MOTION KIT. Every animation on the site comes from this file.
   Tune speed and feel here and it changes everywhere.
   Rules: transform and opacity only, fire once, honour reduced motion.
------------------------------------------------------------------- */
import { type ReactNode, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'

/** Snappy with a small overshoot: the "tactile" curve. */
export const EASE_SNAP = [0.2, 0.9, 0.25, 1.15] as const
/** Calm, no overshoot: for fades and page changes. */
export const EASE_CALM = [0.22, 0.61, 0.36, 1] as const

export const DUR = { fast: 0.2, base: 0.32, slow: 0.45 } as const
export const RISE = 18 // px an element travels when it reveals
export const STAGGER = 0.07 // seconds between children

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren: 0.04 } },
}

function itemVariants(reduced: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : RISE },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? DUR.fast : DUR.slow, ease: reduced ? EASE_CALM : EASE_SNAP },
    },
  }
}

type RevealProps = {
  children: ReactNode
  className?: string
  /** stagger direct <RevealItem> children instead of revealing as one block */
  stagger?: boolean
  /** animate on mount (hero) instead of when scrolled into view */
  onMount?: boolean
  delay?: number
}

/** Fade and rise, once. Wrap a section, or use stagger with RevealItem children. */
export function Reveal({ children, className, stagger, onMount, delay = 0 }: RevealProps) {
  const reduced = !!useReducedMotion()
  const trigger = onMount
    ? { animate: 'show' as const }
    : { whileInView: 'show' as const, viewport: { once: true, margin: '0px 0px -12% 0px' } }

  if (stagger) {
    return (
      <motion.div className={className} variants={container} initial="hidden" {...trigger}>
        {children}
      </motion.div>
    )
  }
  const v = itemVariants(reduced)
  return (
    <motion.div
      className={className}
      variants={v}
      initial="hidden"
      transition={{ delay }}
      {...trigger}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = !!useReducedMotion()
  return (
    <motion.div className={className} variants={itemVariants(reduced)}>
      {children}
    </motion.div>
  )
}

/** Short fade-slide between pages. Keyed by path so back/forward also animate. */
export function PageTransition({ pageKey, children }: { pageKey: string; children: ReactNode }) {
  const reduced = !!useReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: reduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -6 }}
        transition={{ duration: DUR.fast, ease: EASE_CALM }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/** Hover lift and press-down for anything clickable. */
export function Pressable({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = !!useReducedMotion()
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block' }}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { y: 1, scale: 0.97 }}
      transition={{ duration: DUR.fast, ease: EASE_SNAP }}
    >
      {children}
    </motion.span>
  )
}

/** Typewriter reveal. Latin metadata only: never pass Urdu text here. */
export function TypeReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = !!useReducedMotion()
  const [n, setN] = useState(reduced ? text.length : 0)

  useEffect(() => {
    if (reduced) {
      setN(text.length)
      return
    }
    setN(0)
    let i = 0
    let timer: number
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        i += 1
        setN(i)
        if (i >= text.length) window.clearInterval(timer)
      }, 28)
    }, delay * 1000)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(timer)
    }
  }, [text, delay, reduced])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {/* invisible remainder keeps the layout from shifting */}
      <span aria-hidden="true" style={{ opacity: 0 }}>
        {text.slice(n)}
      </span>
    </span>
  )
}

export { motion, useReducedMotion }
