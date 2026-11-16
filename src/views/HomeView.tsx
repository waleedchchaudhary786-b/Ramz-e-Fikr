import { useMemo, type CSSProperties } from 'react'
import { CountUp, Doodle, Pressable, Reveal, RevealItem, StampIn, Stick, Sweep, TypeReveal, WordReveal } from '../utils/motion'
import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { Divider, SectionHead, Stamp, Sym } from '../components/Symbols'
import { BookStack, CurlArrow, FrameCorners, Pen, Rosette, Scribble, Seal, Sparks, Star } from '../components/Doodles'
import { useArticles, useStore } from '../services/store'
import { pickMotion } from './MotionsView'
import { allMotions, allResources, formatDate, glossary, motions, resources, weeklyPrompt } from '../data/sample'

/** Section number sitting in the notebook margin (desktop only). */
function MarginNo({ n, label }: { n: string; label: string }) {
  return (
    <div className="margin-no" aria-hidden="true">
      <Doodle className="block">
        <span className="numeral block text-5xl">{n}</span>
      </Doodle>
      <span className="label mt-2 block !text-[0.625rem]">{label}</span>
    </div>
  )
}

export default function HomeView() {
  const { user } = useSession()
  const articles = useArticles()
  const lead = articles[0]
  const promptReplies = useStore().posts.filter((p) => p.thread === 'prompt' && !p.flagged).length
  const motionOfDay = useMemo(() => motions[new Date().getDate() % motions.length], [])

  return (
    <>
      {/* ---------- HERO: the one staged entrance ---------- */}
      <section className="wrap pt-8 md:pt-12">
        <div className="frame relative px-5 py-10 md:px-12 md:py-14">
          <FrameCorners />
          <Doodle className="absolute top-6 right-8 hidden text-ink sm:block" delay={0.7}>
            <Star size={30} />
          </Doodle>
          <Doodle className="absolute top-5 right-20 hidden text-gold sm:block" delay={0.8}>
            <Star size={18} />
          </Doodle>

          <StampIn delay={1.3} className="absolute bottom-4 left-5 z-10 hidden text-oxblood/75 md:block lg:left-auto lg:right-[42%]">
            <Seal size={92} style={{ transform: 'rotate(-14deg)' }} />
          </StampIn>
          <Reveal stagger onMount className="relative grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <RevealItem>
                <TypeReveal className="label" text="Vol. I · 2026 · An open archive of debate" delay={0.2} />
              </RevealItem>
              <RevealItem>
                <h1 className="mt-4 text-[2.5rem] font-black sm:text-5xl md:text-6xl">
                  <WordReveal text="Where thought becomes" delay={0.15} />{' '}
                  <span className="relative inline-block px-3 text-ivory">
                    <Sweep
                      className="absolute inset-x-0 top-[12%] bottom-[2%] block -rotate-1 bg-oxblood [filter:url(#brush)]"
                      delay={0.45}
                    />
                    <WordReveal className="relative italic" text="argument." delay={0.6} />
                    <Doodle className="absolute -top-5 -right-7 block text-oxblood" delay={0.95}>
                      <Sparks size={30} style={{ transform: 'rotate(150deg)' }} />
                    </Doodle>
                  </span>
                </h1>
              </RevealItem>
              <RevealItem>
                <p className="hand mt-4 -rotate-2 text-[1.75rem] text-oxblood md:text-3xl">…for people who are always ready for a good debate!</p>
              </RevealItem>
              <RevealItem>
                <p className="measure mt-4 text-lg text-charcoal">
                  Motions to practise, guides to prepare with, essays to disagree with, and a floor to argue back on.
                </p>
              </RevealItem>
              <RevealItem className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Pressable>
                  <Link to="/motions" className="btn btn-primary">
                    Browse the motions <span aria-hidden="true" className="arrow">⟶</span>
                  </Link>
                </Pressable>
                <Link to="/articles" className="link-underline pb-0.5 font-bold text-oxblood">
                  Read the latest essay
                </Link>
              </RevealItem>
            </div>

            <div className="relative">
              <Rosette
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-auto max-w-[105%] text-gold opacity-30"
                size={340}
              />
              <Doodle className="absolute -top-14 -left-24 hidden text-oxblood lg:block" delay={1.05}>
                <CurlArrow size={120} />
              </Doodle>
              <Stick rest={1.5} delay={0.55} className="torn-wrap relative mx-auto max-w-sm lg:mr-0">
                <span className="tape -top-2.5 right-8 z-10 rotate-6" aria-hidden="true" />
                <aside className="torn bg-parchment px-7 py-9" aria-label="Motion of the day">
                  <p className="label">
                    <Sym name="pilcrow" className="mr-1.5" />
                    Motion of the day
                  </p>
                  <p className="hand mt-1 text-xl text-oxblood">could you argue both sides?</p>
                  <p className="mt-3 font-display text-[1.375rem] leading-snug font-bold">{motionOfDay.text}</p>
                  <p className="meta mt-3">
                    {motionOfDay.format} · {motionOfDay.theme}
                  </p>
                  <Scribble className="my-4 block h-2.5 w-full text-border-warm" />
                  <Link to="/motions" onClick={() => pickMotion(motionOfDay.slug)} className="inline-flex min-h-11 items-center text-sm font-bold text-oxblood">
                    Start a 15-minute prep <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
                  </Link>
                </aside>
              </Stick>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="wrap">
        <div className="ledger mt-14 pb-4 md:mt-20">
          {/* ---------- 01 · LEAD ESSAY: a book with a spine ---------- */}
          <section className="ledger-row" aria-labelledby="lead-h">
            <MarginNo n="01" label="Essay" />
            <Reveal>
              <SectionHead
                symbol="hand"
                title="The latest essay"
                purpose="One argument, made carefully."
                action={
                  <Link to="/articles" className="meta hidden whitespace-nowrap hover:text-oxblood sm:block">
                    All articles <span className="arrow">⟶</span>
                  </Link>
                }
              />
              <div className="relative md:pr-10">
                <Link to={`/articles/${lead.slug}`} className="group card flex flex-col md:flex-row">
                  <span className="flex shrink-0 items-center justify-between bg-oxblood px-5 py-2 text-ivory md:w-14 md:flex-col md:px-0 md:py-5">
                    <span className="font-mono text-xs tracking-[0.2em] uppercase md:rotate-180 md:whitespace-nowrap md:[writing-mode:vertical-rl]">Ramz-e-Fikr · Essays</span>
                    <Sym name="fe" tone="inherit" className="text-xl text-gold" />
                  </span>
                  <span className="block p-6 md:p-9 md:pr-64">
                    <h3 id="lead-h" className="text-3xl font-bold md:text-[2.5rem]">
                      <span className="misreg" data-text={lead.title}>
                        {lead.title}
                      </span>
                    </h3>
                    <span className="measure mt-3 block text-charcoal">{lead.excerpt}</span>
                    <span className="meta mt-5 block">
                      By {lead.authorName} · {formatDate(lead.date)} · {lead.readMins} min read · {lead.category}
                    </span>
                    <span className="mt-5 inline-flex min-h-11 items-center font-bold text-oxblood">
                      Read the essay <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
                    </span>
                  </span>
                </Link>

                {/* the Ramz, on a torn slip pinned across the corner of the book */}
                <Stick
                  rest={2.5}
                  delay={0.2}
                  className="torn-wrap pointer-events-none relative z-10 mx-4 -mt-3 md:absolute md:right-0 md:-bottom-9 md:mx-0 md:mt-0 md:w-72"
                >
                  <span className="tape -top-2.5 left-8 z-10 -rotate-6" aria-hidden="true" />
                  <div className="torn bg-parchment px-6 py-7">
                    <StampIn>
                      <Stamp>Latest Ramz</Stamp>
                    </StampIn>
                    <p className="mt-3 font-display text-[1.0625rem] leading-snug text-oxblood italic">{lead.ramz}</p>
                    <Doodle className="absolute right-5 bottom-4 block text-ink" delay={0.5}>
                      <Pen size={34} />
                    </Doodle>
                  </div>
                </Stick>
              </div>
            </Reveal>
          </section>

          {/* ---------- 02 · MOTIONS as a contents page, RESOURCES as catalogue cards ---------- */}
          <section className="ledger-row mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-10">
            <MarginNo n="02" label="Archive" />
            <Reveal className="lg:col-span-7">
              <SectionHead symbol="pilcrow" title="Newest motions" purpose="Fresh topics to practise on." />
              <ol>
                {motions.slice(0, 4).map((m, i) => (
                  <li key={m.slug} className="border-b border-border-warm">
                    <Link to="/motions" onClick={() => pickMotion(m.slug)} className="toc group flex gap-4 py-4">
                      <span className="relative w-10 shrink-0 pt-0.5" aria-hidden="true">
                        <span className="toc-no numeral block text-[1.75rem]">{String(i + 1).padStart(2, '0')}</span>
                        <Sym name="hand" className="toc-hand absolute top-0 left-0 block text-2xl" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg leading-snug font-bold">
                          <span className="misreg" data-text={m.text}>
                            {m.text}
                          </span>
                        </span>
                        <span className="meta mt-1.5 flex items-baseline gap-2">
                          <span className="whitespace-nowrap">
                            {m.format} · {m.theme}
                          </span>
                          <span className="leader" aria-hidden="true" />
                          <span className="whitespace-nowrap">{formatDate(m.date)}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Link to="/motions" className="mt-4 inline-flex min-h-11 items-center font-bold text-oxblood">
                All motions <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
              </Link>
            </Reveal>

            <Reveal className="lg:col-span-5">
              <SectionHead
                symbol="section"
                title="Newest resources"
                purpose="Pulled from the catalogue."
                action={
                  <Doodle className="hidden w-36 text-ink sm:block lg:hidden" delay={0.25}>
                    <BookStack labels={['Guides', 'Casefiles', 'Worksheets']} />
                  </Doodle>
                }
              />
              <ul className="mt-6 px-1">
                {resources.slice(0, 3).map((r, i) => (
                  <li key={r.slug} className={i === 0 ? '' : '-mt-3'} style={{ marginLeft: ['0', '1.5rem', '0.5rem'][i] }}>
                    <Link
                      to={`/resources/${r.slug}`}
                      className="index-card group px-5 pt-2.5 pb-9"
                      style={{ '--tilt': ['-1.6deg', '1.2deg', '-0.6deg'][i] } as CSSProperties}
                    >
                      <span className="flex items-baseline justify-between font-mono text-xs tracking-[0.12em] uppercase">
                        <span className="text-oxblood">{r.kind}</span>
                        <span className="text-charcoal">{formatDate(r.date)}</span>
                      </span>
                      <span className="mt-4 block font-display text-lg leading-snug font-bold">{r.title}</span>
                      <span className="mt-1 block text-[0.9375rem] leading-[1.55rem] text-charcoal">{r.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/resources" className="mt-5 inline-flex min-h-11 items-center font-bold text-oxblood">
                All resources <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
              </Link>
            </Reveal>
          </section>

          {/* ---------- the archive in numbers, and the city chapters ---------- */}
          <section className="ledger-row mt-16 md:mt-24" aria-label="The archive in numbers">
            <Reveal>
              <div className="frame relative grid gap-8 px-6 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-10">
                <FrameCorners />
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                  {[
                    [allMotions.length, 'motions'],
                    [allResources.length, 'resources'],
                    [articles.length, 'essays'],
                    [glossary.length, 'glossary terms'],
                  ].map(([n, label]) => (
                    <div key={label}>
                      <dt className="sr-only">{label}</dt>
                      <dd>
                        <CountUp to={n as number} className="block font-display text-5xl leading-none font-black text-oxblood" />
                        <span className="label mt-1.5 block">{label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap items-center gap-4 md:max-w-xs md:justify-end">
                  <StampIn delay={0.2}>
                    <Stamp>City chapter · Lahore</Stamp>
                  </StampIn>
                  <StampIn delay={0.35}>
                    <Stamp className="!rotate-2">City chapter · Faisalabad</Stamp>
                  </StampIn>
                  <Link to="/desk" className="hand -rotate-2 text-2xl text-oxblood">
                    next stop: your city? <span className="arrow">⟶</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>

          <div className="ledger-row mt-14 md:mt-20">
            <Divider />
          </div>

          {/* ---------- 03 · THE FLOOR: a lectern with a note hanging off it ---------- */}
          <section className="ledger-row mt-14 md:mt-20" aria-labelledby="floor-h">
            <MarginNo n="03" label="The Floor" />
            <Reveal>
              <div className="relative pb-16 md:pb-10">
                <div className="relative bg-oxblood px-6 pt-10 pb-24 text-ivory md:mr-16 md:px-12 md:pt-14 md:pb-20">
                  <div className="pointer-events-none absolute inset-2 border border-gold/60" aria-hidden="true" />
                  <Doodle className="absolute top-7 right-8 hidden text-gold sm:block" delay={0.3}>
                    <Star size={30} />
                  </Doodle>
                  <p className="label !text-ivory/85">
                    <Sym name="leaf" tone="gold" className="mr-1.5" />
                    The Floor · Prompt of the week
                  </p>
                  <h2 id="floor-h" className="mt-4 max-w-2xl pr-8 text-3xl font-bold italic md:text-[2.75rem]">
                    <WordReveal text={`“${weeklyPrompt.text}”`} />
                  </h2>
                  <Sweep className="mt-3 block h-3 w-56 max-w-full text-gold" delay={0.35}>
                    <Scribble className="h-full w-full" />
                  </Sweep>
                </div>

                <Stick rest={-2} delay={0.3} className="torn-wrap absolute right-3 bottom-0 w-64 md:right-0 md:w-72">
                  <span className="tape -top-2.5 right-10 z-10 rotate-3" aria-hidden="true" />
                  <div className="torn bg-parchment px-6 py-7">
                    <p className="label">{weeklyPrompt.week}</p>
                    <p className="mt-1 font-display text-xl font-bold">{promptReplies} {promptReplies === 1 ? 'reply' : 'replies'} so far</p>
                    <Pressable className="mt-3">
                      <Link to="/floor" className="btn btn-primary">
                        Take the floor <span aria-hidden="true" className="arrow">⟶</span>
                      </Link>
                    </Pressable>
                  </div>
                </Stick>
              </div>
            </Reveal>
          </section>
        </div>
      </div>

      {/* ---------- NEW HERE: site info, hidden for members ---------- */}
      {!user && (
        <section className="wrap mt-14" aria-labelledby="new-h">
          <Stick rest={-0.8} className="torn-wrap relative max-w-3xl">
            <span className="tape -top-2.5 left-10 z-10 -rotate-3" aria-hidden="true" />
            <div className="torn bg-parchment px-7 py-9 md:px-10">
              <h2 id="new-h" className="hand text-3xl text-oxblood">
                New here?
              </h2>
              <p className="measure mt-2 text-[0.9375rem]">
                Everything on Ramz-e-Fikr is free to read. Create an account to reply on the Floor, save motions and
                submit your own essay for review. The{' '}
                <Link to="/about#guide" className="font-bold text-link-blue underline underline-offset-2">
                  user guide
                </Link>{' '}
                explains how it all works.
              </p>
            </div>
          </Stick>
        </section>
      )}
    </>
  )
}
