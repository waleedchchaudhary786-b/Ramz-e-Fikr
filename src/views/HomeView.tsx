import { useMemo } from 'react'
import { Doodle, Pressable, Reveal, RevealItem, StampIn, Stick, Sweep, TypeReveal, WordReveal } from '../utils/motion'
import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { Divider, SectionHead, Stamp, Sym } from '../components/Symbols'
import { BookStack, CurlArrow, FrameCorners, Pen, Rosette, Scribble, Sparks, Star } from '../components/Doodles'
import { articles, formatDate, motions, resources, weeklyPrompt } from '../data/sample'

export default function HomeView() {
  const { user } = useSession()
  const lead = articles[0]
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
                <p className="measure mt-5 text-lg text-charcoal">
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
                  <p className="mt-3 font-display text-[1.375rem] leading-snug font-bold">{motionOfDay.text}</p>
                  <p className="meta mt-3">
                    {motionOfDay.format} · {motionOfDay.theme}
                  </p>
                  <Scribble className="my-4 block h-2.5 w-full text-border-warm" />
                  <Link to="/motions" className="inline-flex min-h-11 items-center text-sm font-bold text-oxblood">
                    Start a 15-minute prep <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
                  </Link>
                </aside>
              </Stick>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- LEAD STORY ---------- */}
      <section className="wrap mt-14 md:mt-20" aria-labelledby="lead-h">
        <Reveal>
          <SectionHead
            symbol="hand"
            title="The latest essay"
            purpose="One argument, made carefully."
            action={
              <Link to="/articles" className="meta hidden whitespace-nowrap hover:text-oxblood sm:block">
                All articles ⟶
              </Link>
            }
          />
          <Link to={`/articles/${lead.slug}`} className="group card relative block p-6 md:p-9">
            <Doodle className="absolute top-6 right-7 hidden text-ink md:block" delay={0.3}>
              <Pen size={72} />
            </Doodle>
            <StampIn>
              <Stamp>Latest Ramz</Stamp>
            </StampIn>
            <p className="measure mt-4 font-display text-lg text-oxblood italic md:text-xl">
              <Sym name="hand" className="mr-2 not-italic" />
              {lead.ramz}
            </p>
            <h3 id="lead-h" className="mt-5 text-3xl font-bold md:text-[2.5rem]">
              <span className="misreg" data-text={lead.title}>
                {lead.title}
              </span>
            </h3>
            <p className="measure mt-3 text-charcoal">{lead.excerpt}</p>
            <p className="meta mt-5">
              By {lead.authorName} · {formatDate(lead.date)} · {lead.readMins} min read · {lead.category}
            </p>
          </Link>
        </Reveal>
      </section>

      {/* ---------- NEWEST MOTIONS + RESOURCES ---------- */}
      <section className="wrap mt-14 grid gap-12 md:mt-20 lg:grid-cols-2">
        <Reveal>
          <SectionHead symbol="pilcrow" title="Newest motions" purpose="Fresh topics to practise on." />
          <ul>
            {motions.slice(0, 3).map((m) => (
              <li key={m.slug} className="border-b border-border-warm">
                <Link to="/motions" className="group row py-4">
                  <Sym name="hand" className="row-hand text-lg" />
                  <div className="row-body">
                  <p className="font-display text-lg leading-snug font-bold">
                    <span className="misreg" data-text={m.text}>
                      {m.text}
                    </span>
                  </p>
                  <p className="meta mt-1.5">
                    {m.format} · {m.theme} · {formatDate(m.date)}
                  </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/motions" className="mt-4 inline-flex min-h-11 items-center font-bold text-oxblood">
            All motions <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
          </Link>
        </Reveal>

        <Reveal>
          <SectionHead
            symbol="section"
            title="Newest resources"
            purpose="Guides and casefiles to prepare with."
            action={
              <Doodle className="hidden w-44 text-ink sm:block" delay={0.25}>
                <BookStack labels={['Guides', 'Casefiles', 'Worksheets']} />
              </Doodle>
            }
          />
          <ul>
            {resources.slice(0, 3).map((r) => (
              <li key={r.slug} className="border-b border-border-warm">
                <Link to="/resources" className="group row py-4">
                  <Sym name="hand" className="row-hand text-lg" />
                  <div className="row-body">
                  <p className="font-display text-lg leading-snug font-bold">
                    <span className="misreg" data-text={r.title}>
                      {r.title}
                    </span>
                  </p>
                  <p className="mt-1 text-[0.9375rem] text-charcoal">{r.summary}</p>
                  <p className="meta mt-1.5">
                    {r.kind} · {formatDate(r.date)}
                  </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/resources" className="mt-4 inline-flex min-h-11 items-center font-bold text-oxblood">
            All resources <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
          </Link>
        </Reveal>
      </section>

      <div className="wrap mt-14 md:mt-20">
        <Divider />
      </div>

      {/* ---------- THE FLOOR TEASER ---------- */}
      <section className="wrap mt-14 md:mt-20" aria-labelledby="floor-h">
        <Reveal>
          <div className="relative bg-oxblood px-6 py-10 text-ivory md:px-12 md:py-14">
            <div className="pointer-events-none absolute inset-2 border border-gold/60" aria-hidden="true" />
            <Doodle className="absolute right-8 bottom-8 block text-gold md:right-12" delay={0.3}>
              <Star size={34} />
            </Doodle>
            <Doodle className="absolute right-20 bottom-14 block text-gold md:right-28" delay={0.42}>
              <Star size={18} />
            </Doodle>
            <p className="label !text-ivory/85">
              <Sym name="leaf" tone="gold" className="mr-1.5" />
              The Floor · Prompt of the week
            </p>
            <h2 id="floor-h" className="mt-4 max-w-3xl pr-10 text-3xl font-bold italic md:text-[2.75rem]">
              <WordReveal text={`“${weeklyPrompt.text}”`} />
            </h2>
            <Sweep className="mt-3 block h-3 w-56 max-w-full text-gold" delay={0.35}>
              <Scribble className="h-full w-full" />
            </Sweep>
            <p className="mt-4 font-mono text-[0.8125rem] text-ivory/85">
              {weeklyPrompt.week} · {weeklyPrompt.replies} replies so far
            </p>
            <div className="relative mt-7">
              <Pressable>
                <Link
                  to="/floor"
                  className="btn border-ivory bg-ivory text-oxblood"
                  style={{ boxShadow: '3px 3px 0 var(--color-gold)' }}
                >
                  Take the floor <span aria-hidden="true" className="arrow">⟶</span>
                </Link>
              </Pressable>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- NEW HERE: site info, hidden for members ---------- */}
      {!user && (
        <section className="wrap mt-14" aria-labelledby="new-h">
          <Stick rest={-0.8} className="torn-wrap relative max-w-3xl">
            <span className="tape -top-2.5 left-10 z-10 -rotate-3" aria-hidden="true" />
            <div className="torn bg-parchment px-7 py-9 md:px-10">
              <h2 id="new-h" className="label !font-bold !text-ink">
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
