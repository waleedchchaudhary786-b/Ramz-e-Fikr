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
    <svg {...base} viewBox="0 0 40 40" width={size} height={size} className={`boil ${className ?? ''}`} style={style} strokeWidth="1.6">
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
    <svg {...base} viewBox="0 0 120 80" width={size} height={(size * 80) / 120} className={className} style={style} strokeWidth="1.8">
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
    <svg {...base} viewBox="0 0 64 64" width={size} height={size} className={`pen-write ${className ?? ''}`} style={style} strokeWidth="1.7">
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
    <svg {...base} viewBox={`0 0 220 ${rows.length * h + 16}`} className={className} style={style} strokeWidth="1.6">
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
    <svg aria-hidden="true" viewBox="0 0 120 120" width={size} height={size} className={`seal ${className ?? ''}`} style={style}>
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

/** A brush stroke with ragged ends, drawn once as a shape. It stretches to fill its box.
    (Pre-drawn on purpose: live SVG distortion filters made scrolling slow.) */
export function Brush({ className, style }: Omit<P, 'size'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 60" preserveAspectRatio="none" className={className} style={style} fill="currentColor">
      <polygon points="6,2.8 15,3.3 24,4.9 33,2.8 42,3.0 51,3.4 60,1.6 69,3.1 78,3.6 87,4.3 96,1.2 105,2.1 114,1.2 123,4.4 132,3.9 141,1.0 150,5.1 159,5.0 168,3.7 177,3.5 186,1.5 195,0.9 204,3.1 213,1.1 222,1.6 231,1.9 240,0.9 249,2.8 258,2.7 267,4.5 276,3.1 285,3.6 294,3.0 299.3,9 299.6,15 294.4,22 298.8,28 296.1,35 296.9,41 298.7,48 294.9,53 294,57.7 285,56.8 276,56.0 267,59.2 258,59.2 249,58.5 240,57.9 231,56.2 222,55.8 213,56.1 204,55.1 195,58.2 186,56.6 177,58.5 168,56.5 159,59.0 150,58.5 141,54.8 132,55.7 123,58.8 114,56.9 105,59.1 96,56.5 87,55.1 78,57.6 69,58.2 60,56.0 51,55.2 42,56.3 33,59.0 24,58.1 15,55.3 6,55.9 0.8,52 3.9,45 0.7,39 2.5,32 1.3,26 1.6,19 5.8,12 4.8,7" />
      {/* dry-brush streaks trailing off the right end */}
      <polygon points="286,10 300,8.5 300,10.5 288,12" opacity=".75" />
      <polygon points="284,30 300,29 300,31.5 286,32.5" opacity=".6" />
      <polygon points="287,46 299,45 299,47 288,48" opacity=".7" />
    </svg>
  )
}
