/* Hand-drawn doodles in the style of the Ramz-e-Fikr posters: sketchy stars,
   spark lines, dashed curl arrows, scribble underlines, a fountain pen, a
   stack of books, corner ornaments and a faint rosette. All original SVG,
   all decorative (aria-hidden), all in palette colours via currentColor. */
import type { CSSProperties } from 'react'

type P = { className?: string; style?: CSSProperties; size?: number }
const base = { 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function starPoints(cx: number, cy: number, R: number, r: number, rot = -90) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = ((rot + i * 36) * Math.PI) / 180
    const rad = i % 2 === 0 ? R : r
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

/** Sketched star: drawn twice, slightly off, like a pen going round again. */
export function Star({ className, style, size = 28 }: P) {
  return (
    <svg {...base} viewBox="0 0 40 40" width={size} height={size} className={`boil ${className ?? ''}`} style={{ filter: 'url(#sketch)', ...style }} strokeWidth="1.6">
      <polygon points={starPoints(20, 21, 15, 6.5)} />
      <polygon points={starPoints(20.6, 20.4, 14, 6, -86)} opacity=".55" />
    </svg>
  )
}

/** Three short emphasis strokes. */
export function Sparks({ className, style, size = 30 }: P) {
  return (
    <svg {...base} viewBox="0 0 40 40" width={size} height={size} className={className} style={style} strokeWidth="2.4">
      <path d="M6 30 L13 22" />
      <path d="M17 34 L19 22" />
      <path d="M29 35 L25 25" />
    </svg>
  )
}

/** Dashed, looping arrow that points from one thing to the next. */
export function CurlArrow({ className, style, size = 110 }: P) {
  return (
    <svg {...base} viewBox="0 0 120 80" width={size} height={(size * 80) / 120} className={className} style={{ filter: 'url(#sketch)', ...style }} strokeWidth="1.8">
      <path d="M4 60 C 26 22, 50 18, 58 36 C 64 52, 44 56, 46 40 C 48 20, 84 14, 108 30" strokeDasharray="6 6" />
      <path d="M96 20 L109 30 L95 38" />
    </svg>
  )
}

/** Hand-drawn underline. Stretch it with width. */
export function Scribble({ className, style }: Omit<P, 'size'>) {
  return (
    <svg {...base} viewBox="0 0 200 14" preserveAspectRatio="none" className={className} style={style} strokeWidth="3">
      <path d="M3 8 C 40 3, 95 11, 197 4" vectorEffect="non-scaling-stroke" />
      <path d="M30 12 C 70 9, 120 12, 170 10" vectorEffect="non-scaling-stroke" strokeWidth="1.5" opacity=".7" />
    </svg>
  )
}

/** Fountain pen, drawn at a slant. */
export function Pen({ className, style, size = 64 }: P) {
  return (
    <svg {...base} viewBox="0 0 64 64" width={size} height={size} className={`pen-write ${className ?? ''}`} style={{ filter: 'url(#sketch)', ...style }} strokeWidth="1.7">
      <path d="M44 6 L58 20 L30 48 L16 34 Z" />
      <path d="M40 10 L54 24" />
      <path d="M16 34 L8 56 L30 48" />
      <path d="M8 56 L20 44" />
      <circle cx="21" cy="43" r="1.6" fill="currentColor" stroke="none" />
      <path d="M4 60 C 8 56, 12 62, 16 59" strokeWidth="1.3" />
    </svg>
  )
}

/** A leaning stack of books with hand-lettered spines. */
export function BookStack({ className, style, labels }: Omit<P, 'size'> & { labels: string[] }) {
  const h = 26
  const rows = labels.slice(0, 4)
  return (
    <svg {...base} viewBox={`0 0 220 ${rows.length * h + 16}`} className={className} style={{ filter: 'url(#sketch)', ...style }} strokeWidth="1.6">
      {rows.map((label, i) => {
        const x = [10, 4, 12, 0][i % 4]
        const y = 6 + i * h
        return (
          <g key={label} transform={`translate(${x} ${y})`}>
            <path d={`M0 2 L168 0 L196 6 L196 ${h - 4} L168 ${h} L0 ${h - 2} Z`} fill="var(--color-ivory)" />
            <path d={`M168 0 L168 ${h}`} />
            <path d={`M176 6 L192 9 M176 12 L192 14 M176 18 L192 19`} strokeWidth="1" />
            <text x="84" y={h / 2 + 5} textAnchor="middle" fill="currentColor" stroke="none" style={{ font: '700 11px var(--font-mono)', letterSpacing: '0.12em' }}>
              {label.toUpperCase()}
            </text>
          </g>
        )
      })}
      <path d={`M2 ${rows.length * h + 10} C 60 ${rows.length * h + 14}, 150 ${rows.length * h + 8}, 214 ${rows.length * h + 12}`} strokeWidth="1.2" opacity=".6" />
    </svg>
  )
}

/** Gold diamond ornaments for the four corners of a .frame. */
export function FrameCorners() {
  const pos = ['-top-[7px] -left-[7px]', '-top-[7px] -right-[7px]', '-bottom-[7px] -left-[7px]', '-bottom-[7px] -right-[7px]']
  return (
    <>
      {pos.map((p) => (
        <svg key={p} aria-hidden="true" viewBox="0 0 14 14" width="14" height="14" className={`absolute ${p} text-gold`}>
          <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="var(--color-ivory)" stroke="currentColor" />
          <path d="M7 3.5 L10.5 7 L7 10.5 L3.5 7 Z" fill="currentColor" />
        </svg>
      ))}
    </>
  )
}

/** Faint geometric rosette watermark, as on the posters. */
export function Rosette({ className, style, size = 300 }: P) {
  return (
    <svg {...base} viewBox="0 0 200 200" width={size} height={size} className={className} style={style} strokeWidth="1">
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="100" cy="100" rx="88" ry="34" transform={`rotate(${i * 15} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="92" />
      <circle cx="100" cy="100" r="22" />
    </svg>
  )
}

/** The Ramz seal: the ف monogram ringed by the name and tagline, like a library stamp. */
export function Seal({ className, style, size = 120 }: P) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" width={size} height={size} className={`seal ${className ?? ''}`} style={{ filter: 'url(#ink-bleed)', ...style }}>
      <defs>
        <path id="seal-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="60" r="53" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <text fill="currentColor" style={{ font: '700 9.4px var(--font-mono)', letterSpacing: '0.2em' }}>
        <textPath href="#seal-ring" startOffset="0">
          RAMZ-E-FIKR ✦ WHERE THOUGHT BECOMES ARGUMENT ✦
        </textPath>
      </text>
      <text x="60" y="74" textAnchor="middle" fill="currentColor" style={{ font: '700 40px var(--font-urdu)' }}>
        ف
      </text>
    </svg>
  )
}
