/* Resources and Glossary. */
import { useMemo, useState, type CSSProperties } from 'react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion } from '../utils/motion'
import { Filter, Fold, Reaction } from '../components/Bits'
import { PageHead } from './PlaceholderView'
import { Link, useRouter } from '../utils/router'
import { Reveal, Stick } from '../utils/motion'
import { Divider, Sym } from '../components/Symbols'
import { Scribble } from '../components/Doodles'
import { allResources, formatDate, glossary, resourceDetails } from '../data/sample'

const KINDS = ['Guide', 'Casefile', 'Worksheet', 'Lecture notes'] as const
const TILTS = ['-1.2deg', '0.9deg', '-0.5deg', '1.4deg', '-0.9deg', '0.6deg']

export function ResourcesView() {
  const { path } = useRouter()
  const slug = path.split('/')[2]
  const [kind, setKind] = useState<(typeof KINDS)[number] | 'All'>('All')
  if (slug) return <ResourceReader slug={slug} />
  const list = allResources.filter((r) => kind === 'All' || r.kind === kind)
  return (
    <>
      <PageHead symbol="section" title="Resources" purpose="Guides, casefiles and worksheets, filed like a library catalogue."
        note="Pull a card. Open it. Take what you need."
      />
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
                <div className="index-card group h-full px-5 pt-2.5 pb-10" style={{ '--tilt': TILTS[i % TILTS.length] } as CSSProperties}>
                  <p className="flex items-baseline justify-between font-mono text-xs tracking-[0.12em] uppercase">
                    <span className="text-oxblood">{r.kind}</span>
                    <span className="text-charcoal">{formatDate(r.date)}</span>
                  </p>
                  <h2 className="mt-4 text-lg leading-snug font-bold">
                    {/* the whole card is the link */}
                    <Link to={`/resources/${r.slug}`} className="after:absolute after:inset-0">
                      <span className="misreg" data-text={r.title}>
                        {r.title}
                      </span>
                    </Link>
                  </h2>
                  <p className="mt-1 text-[0.9375rem] leading-[1.55rem] text-charcoal">{r.summary}</p>
                  <p className="mt-2 text-sm font-bold text-oxblood">
                    Open <span aria-hidden="true" className="arrow">⟶</span>
                  </p>
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
      <PageHead symbol="dagger" title="Glossary" purpose="Debate terms in plain language, in English and Urdu."
        note="Every circuit has its own words. Here are ours."
      />
      <div className="wrap max-w-3xl">
        <label className="block">
          <span className="label">Look up a term</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="rebuttal, whip, تردید…"
            className="paper-input mt-1"
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

/** A point you can tick off as you work through it. */
function Tick({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <li>
      <button type="button" aria-pressed={done} onClick={() => setDone((d) => !d)} className="group flex w-full gap-3 py-1 text-left text-[1.0625rem] leading-relaxed">
        <span className="relative mt-1.5 grid h-5 w-5 shrink-0 place-items-center border-[1.5px] border-oxblood">
          <motion.span
            aria-hidden="true"
            className="font-hand text-2xl leading-none font-bold text-oxblood"
            initial={false}
            animate={{ scale: done ? 1 : 0, rotate: done ? 0 : -30 }}
            transition={{ duration: DUR.base, ease: EASE_SNAP }}
          >
            ✓
          </motion.span>
        </span>
        <span className={`measure transition-opacity duration-300 ${done ? 'opacity-50' : ''}`}>{text}</span>
      </button>
    </li>
  )
}

function ResourceReader({ slug }: { slug: string }) {
  const r = allResources.find((x) => x.slug === slug)
  if (!r)
    return (
      <>
        <PageHead symbol="dagger" title="Not in the catalogue" purpose="That resource could not be found." />
        <div className="wrap">
          <Link to="/resources" className="font-bold text-oxblood">
            All resources <span className="arrow">⟶</span>
          </Link>
        </div>
      </>
    )
  const d = resourceDetails[slug]
  const others = allResources.filter((x) => x.slug !== slug).slice(0, 2)
  return (
    <article className="wrap pt-10 md:pt-14">
      <div className="mx-auto max-w-3xl">
        <Link to="/resources" className="meta hover:text-oxblood">
          ⟵ All resources
        </Link>

        {/* the resource as one large catalogue card */}
        <Stick rest={-0.6} className="relative mt-6">
          <div className="index-card px-6 pt-3 pb-12 md:px-10" style={{ '--tilt': '0deg' } as CSSProperties}>
            <p className="flex items-baseline justify-between font-mono text-xs tracking-[0.12em] uppercase">
              <span className="text-oxblood">{r.kind}</span>
              <span className="text-charcoal">Filed {formatDate(r.date)}</span>
            </p>
            <h1 className="mt-5 text-3xl font-black md:text-[2.75rem]">{r.title}</h1>
            <p className="measure mt-3 text-lg leading-[1.55rem] text-charcoal">{r.summary}</p>
          </div>
        </Stick>

        {d ? (
          <>
            <Reveal>
              <dl className="mt-10 grid gap-5 border-y border-ink/70 py-5 sm:grid-cols-3">
                {[
                  ['Level', d.level],
                  ['Time', d.time],
                  ['Use it when', d.useWhen],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="label">{k}</dt>
                    <dd className="mt-1 text-[0.9375rem]">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="measure mt-8 text-[1.0625rem] leading-[1.8] first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:font-black first-letter:text-oxblood">
                {d.intro}
              </p>
            </Reveal>

            <div className="ledger mt-12">
              {d.sections.map((sec, i) => (
                <Reveal key={sec.heading}>
                  <section className="ledger-row mb-10">
                    <div className="margin-no" aria-hidden="true">
                      <span className="numeral block text-5xl">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{sec.heading}</h2>
                    <Scribble className="mt-1 block h-2.5 w-28 text-oxblood" />
                    {sec.body && <p className="measure mt-3 text-[1.0625rem] leading-[1.8] text-charcoal">{sec.body}</p>}
                    <ul className="mt-3">
                      {sec.points.map((pt) => (
                        <Tick key={pt} text={pt} />
                      ))}
                    </ul>
                  </section>
                </Reveal>
              ))}
            </div>
            <p className="hand -mt-3 -rotate-1 text-xl text-oxblood">tick the boxes as you go ↑</p>

            {d.example && (
              <Stick rest={0.8} className="torn-wrap relative mt-12">
                <span className="tape -top-2.5 right-10 z-10 rotate-6" aria-hidden="true" />
                <section className="torn bg-parchment px-7 py-9">
                  <h2 className="hand text-3xl text-oxblood">{d.example.title}</h2>
                  <ul className="mt-3 space-y-2">
                    {d.example.lines.map((l) => (
                      <li key={l} className="flex gap-3">
                        <Sym name="hand" className="shrink-0" />
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </Stick>
            )}

            <Reveal>
              <section className="mt-12 border-t-2 border-oxblood pt-4">
                <h2 className="label !font-bold !text-ink">Common mistakes</h2>
                <ul className="mt-3 space-y-2">
                  {d.mistakes.map((m) => (
                    <li key={m} className="flex gap-3 text-[1.0625rem]">
                      <Sym name="dagger" className="shrink-0" />
                      <span className="measure">{m}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          </>
        ) : (
          <p className="meta mt-10">The full text of this resource has not been added yet.</p>
        )}

        <div className="mt-8">
          <Reaction kind="bookmark" itemKey={`resource:${slug}`} />
        </div>

        <Divider className="my-12" />
        <h2 className="label !font-bold !text-ink">Next in the drawer</h2>
        <ul className="mt-5 grid gap-6 sm:grid-cols-2">
          {others.map((o, i) => (
            <li key={o.slug}>
              <Link to={`/resources/${o.slug}`} className="index-card group px-5 pt-2.5 pb-9" style={{ '--tilt': ['-1deg', '0.8deg'][i] } as CSSProperties}>
                <span className="block font-mono text-xs tracking-[0.12em] text-oxblood uppercase">{o.kind}</span>
                <span className="mt-4 block font-display text-lg leading-snug font-bold">{o.title}</span>
                <span className="mt-1 block text-[0.9375rem] leading-[1.55rem] text-charcoal">{o.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
