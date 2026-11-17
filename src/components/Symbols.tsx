/* The brand's punctuation set, defined once. Drawn from print tradition.
   Use these for bullets, dividers, stamps and "next" affordances only. */
import type { ReactNode } from 'react'
import { Doodle, Sweep } from '../utils/motion'
import { Scribble } from './Doodles'

export const SYMBOL = {
  hand: '☞', // points at the key idea ("Latest Ramz"), articles
  leaf: '❦', // ornament, the Floor
  asterism: '⁂', // section divider
  section: '§', // resources
  pilcrow: '¶', // motions
  dagger: '†', // notes and corrections
  arrow: '⟶', // "next" affordance
  fe: 'ف', // the Ramz monogram
} as const

export type SymbolName = keyof typeof SYMBOL

type SymProps = { name: SymbolName; className?: string; tone?: 'gold' | 'oxblood' | 'inherit' }

export function Sym({ name, className = '', tone = 'oxblood' }: SymProps) {
  const color = tone === 'gold' ? 'text-gold' : tone === 'oxblood' ? 'text-oxblood' : ''
  const font = name === 'fe' ? 'font-urdu' : 'font-display'
  return (
    <span aria-hidden="true" className={`${font} ${color} ${className}`}>
      {SYMBOL[name]}
    </span>
  )
}

/** Centred ⁂ between hairlines. */
export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} role="separator">
      <span className="h-px flex-1 bg-border-warm" />
      <Doodle className="block">
        <Sym name="asterism" tone="gold" className="text-xl leading-none" />
      </Doodle>
      <span className="h-px flex-1 bg-border-warm" />
    </div>
  )
}

/** Rubber-stamp badge. */
export function Stamp({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`stamp ${className}`}>{children}</span>
}

/** Section heading with its symbol and one-line purpose. */
export function SectionHead({
  symbol,
  title,
  purpose,
  action,
}: {
  symbol: SymbolName
  title: string
  purpose?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold md:text-[1.75rem]">
          <Sym name={symbol} className="mr-2" />
          {title}
        </h2>
        <Sweep className="mt-1 block h-3 w-40 text-oxblood" delay={0.15}>
          <Scribble className="h-full w-full" />
        </Sweep>
        {purpose && <p className="meta mt-1.5">{purpose}</p>}
      </div>
      {action}
    </div>
  )
}
