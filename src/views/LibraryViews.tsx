/* Resources and Glossary. */
import { useMemo, useState, type CSSProperties } from 'react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion } from '../utils/motion'
import { Filter, Fold, Reaction } from '../components/Bits'
import { PageHead } from './PlaceholderView'
import { allResources, formatDate, glossary } from '../data/sample'

const KINDS = ['Guide', 'Casefile', 'Worksheet', 'Lecture notes'] as const
const TILTS = ['-1.2deg', '0.9deg', '-0.5deg', '1.4deg', '-0.9deg', '0.6deg']

export function ResourcesView() {
  const [kind, setKind] = useState<(typeof KINDS)[number] | 'All'>('All')
  const list = allResources.filter((r) => kind === 'All' || r.kind === kind)
  return (
    <>
      <PageHead symbol="section" title="Resources" purpose="Guides, casefiles and worksheets, filed like a library catalogue." />
      <div className="wrap">
        <Filter label="Drawer" options={KINDS} value={kind} onChange={setKind} />
        <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((r, i) => (
              <motion.li
                key={r.slug}
                layout
                initial={{ opacity: 0, y: -18, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: DUR.slow, ease: EASE_SNAP, delay: i * 0.04 }}
              >
                <div className="index-card h-full px-5 pt-2.5 pb-10" style={{ '--tilt': TILTS[i % TILTS.length] } as CSSProperties}>
                  <p className="flex items-baseline justify-between font-mono text-xs tracking-[0.12em] uppercase">
                    <span className="text-oxblood">{r.kind}</span>
                    <span className="text-charcoal">{formatDate(r.date)}</span>
                  </p>
                  <h2 className="mt-4 text-lg leading-snug font-bold">{r.title}</h2>
                  <p className="mt-1 text-[0.9375rem] leading-[1.55rem] text-charcoal">{r.summary}</p>
                  <div className="mt-3">
                    <Reaction kind="bookmark" itemKey={`resource:${r.slug}`} />
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </>
  )
}

export function GlossaryView() {
  const [q, setQ] = useState('')
  const groups = useMemo(() => {
    const hit = glossary.filter((t) => (t.term + t.meaning + t.urdu).toLowerCase().includes(q.toLowerCase()))
    const map = new Map<string, typeof glossary>()
    hit.forEach((t) => map.set(t.term[0], [...(map.get(t.term[0]) ?? []), t]))
    return [...map.entries()]
  }, [q])

  return (
    <>
      <PageHead symbol="dagger" title="Glossary" purpose="Debate terms in plain language, in English and Urdu." />
      <div className="wrap max-w-3xl">
        <label className="block">
          <span className="label">Look up a term</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="rebuttal, whip, تردید…"
            className="mt-1 block min-h-11 w-full border border-border-warm bg-white/60 px-3 font-mono focus:border-oxblood focus:outline-none"
          />
        </label>
        <div className="mt-8">
          {groups.map(([letter, terms]) => (
            <section key={letter} className="relative mb-6 pl-14 md:pl-20">
              <span className="numeral absolute top-1 left-0 text-5xl md:text-6xl" aria-hidden="true">
                {letter}
              </span>
              {terms.map((t) => (
                <Fold
                  key={t.term}
                  summary={
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-display text-xl font-bold">{t.term}</span>
                      <span className="urdu text-xl text-oxblood" lang="ur">
                        {t.urdu}
                      </span>
                    </span>
                  }
                >
                  <p className="measure text-charcoal">{t.meaning}</p>
                </Fold>
              ))}
            </section>
          ))}
          {groups.length === 0 && <p className="font-display text-xl italic">No term matches that.</p>}
        </div>
      </div>
    </>
  )
}
