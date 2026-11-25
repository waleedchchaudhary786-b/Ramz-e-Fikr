/* The motion ticker.
   Not hovering: flows. Hover: stops. Press and hold: speeds up (~5.5x).
   Release: stops if still hovering. Pointer leaves: resumes.
   Touch: flows; touch-and-hold speeds up; a quick tap opens the item.
   Keyboard: pauses on focus; hold Space/Enter on the strip to speed up.
   Reduced motion: static row with prev/next buttons. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from '../utils/motion'
import { Link } from '../utils/router'
import { Sym, type SymbolName } from './Symbols'
import { articles, motions } from '../data/sample'
import { pickMotion } from '../views/MotionsView'

const BASE_SPEED = 42 // px per second at normal flow
const FAST = 5.5 // multiplier while held
const RAMP_MS = 90 // time constant: reaches target in about 250ms
const HOLD_MS = 180 // longer than this is a hold, not a tap

export type TickerItem = { key: string; to: string; symbol: SymbolName; text: string; motion?: string }
type Item = TickerItem

function useItems(): Item[] {
  return useMemo(() => {
    const m: Item[] = motions.map((x) => ({ key: 'm-' + x.slug, to: '/motions', symbol: 'pilcrow', text: x.text, motion: x.slug }))
    const a: Item[] = articles.map((x) => ({
      key: 'a-' + x.slug,
      to: '/articles/' + x.slug,
      symbol: 'hand',
      text: x.title,
    }))
    // interleave so kinds alternate
    const out: Item[] = []
    for (let i = 0; i < Math.max(m.length, a.length); i++) {
      if (m[i]) out.push(m[i])
      if (a[i]) out.push(a[i])
    }
    return out
  }, [])
}

/** The site ticker. Pass `items` (and a `label`) to show something else, such as a tournament's announcements. */
export default function Ticker({ items: given, label }: { items?: Item[]; label?: string } = {}) {
  const reduced = !!useReducedMotion()
  const site = useItems()
  const items = given ?? site
  return reduced ? <StaticTicker items={items} label={label} /> : <FlowTicker items={items} label={label} />
}

function FlowTicker({ items, label }: { items: Item[]; label?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const state = useRef({ x: 0, v: 1, hover: false, hold: false, focus: false, downAt: 0, wasHold: false })
  const [hint, setHint] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const s = state.current
      const dt = Math.min(now - last, 64) // clamp: no jump after a hidden tab
      last = now
      const target = s.hold ? FAST : s.hover || s.focus ? 0 : 1
      s.v += (target - s.v) * (1 - Math.exp(-dt / RAMP_MS))
      const half = track.scrollWidth / 2
      if (half > 0) {
        s.x = (s.x + (BASE_SPEED * s.v * dt) / 1000) % half
        track.style.transform = `translate3d(${-s.x}px,0,0)`
      }
      raf = requestAnimationFrame(tick)
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const s = state.current
  const release = () => {
    if (s.hold) s.wasHold = performance.now() - s.downAt > HOLD_MS
    s.hold = false
  }

  return (
    <div
      className="relative border-b border-ink/80 bg-parchment select-none"
      role="region"
      aria-label={`${label ?? 'Latest motions and articles'}. Hold to speed up.`}
      tabIndex={0}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') {
          s.hover = true
          setHint(true)
        }
      }}
      onPointerLeave={() => {
        s.hover = false
        release()
        setHint(false)
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        s.hold = true
        s.wasHold = false
        s.downAt = performance.now()
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onClickCapture={(e) => {
        // a hold must not open the item under the pointer
        if (s.wasHold) {
          e.preventDefault()
          e.stopPropagation()
          s.wasHold = false
        }
      }}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => {
        if (s.hold) e.preventDefault()
      }}
      onFocus={(e) => {
        // pause for keyboard focus only: a mouse press also focuses the strip
        s.focus = (e.target as HTMLElement).matches(':focus-visible')
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          s.focus = false
          s.hold = false
        }
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault()
          s.hold = true
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') s.hold = false
      }}
      style={{ touchAction: 'pan-y', WebkitTouchCallout: 'none' }}
    >
      <div className="overflow-hidden">
        <div ref={trackRef} className="flex w-max will-change-transform">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {items.map((it) => (
                <li key={it.key} className="flex shrink-0 items-center">
                  <Link
                    to={it.to}
                    onClick={() => it.motion && pickMotion(it.motion)}
                    tabIndex={copy === 1 ? -1 : 0}
                    draggable={false}
                    className="flex items-center gap-2 px-5 py-1.5 font-mono text-[0.8125rem] text-ink hover:text-oxblood md:py-2 md:text-sm"
                  >
                    <Sym name={it.symbol} className="text-base leading-none" />
                    <span className="whitespace-nowrap">{it.text}</span>
                  </Link>
                  <span aria-hidden="true" className="text-gold">
                    ·
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <span
        aria-hidden="true"
        className="label pointer-events-none absolute top-1/2 right-0 hidden -translate-y-1/2 bg-parchment py-1 pr-3 pl-4 transition-opacity duration-200 md:block"
        style={{ opacity: hint ? 1 : 0, fontSize: '0.6875rem' }}
      >
        Hold to speed up »
      </span>
    </div>
  )
}

function StaticTicker({ items, label }: { items: Item[]; label?: string }) {
  const ref = useRef<HTMLUListElement>(null)
  const step = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 280 })
  return (
    <div className="flex items-center border-b border-ink/80 bg-parchment" role="region" aria-label={label ?? 'Latest motions and articles'}>
      <button type="button" onClick={() => step(-1)} aria-label="Previous items" className="grid h-11 w-11 shrink-0 place-items-center">
        <ChevronLeft size={18} />
      </button>
      <ul ref={ref} className="flex flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {items.map((it) => (
          <li key={it.key} className="shrink-0">
            <Link to={it.to} onClick={() => it.motion && pickMotion(it.motion)} className="flex items-center gap-2 px-4 py-2 font-mono text-sm">
              <Sym name={it.symbol} />
              <span className="whitespace-nowrap">{it.text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => step(1)} aria-label="Next items" className="grid h-11 w-11 shrink-0 place-items-center">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
