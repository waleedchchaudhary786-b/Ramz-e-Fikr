import { useMemo } from 'react'
import { Pressable, Reveal, RevealItem, TypeReveal } from '../utils/motion'
import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { Divider, SectionHead, Stamp, Sym } from '../components/Symbols'
import { articles, formatDate, motions, resources, weeklyPrompt } from '../data/sample'

export default function HomeView() {
  const { user } = useSession()
  const lead = articles[0]
  const motionOfDay = useMemo(() => motions[new Date().getDate() % motions.length], [])

  return (
    <>
      {/* ---------- HERO: the one staged entrance ---------- */}
      <section className="wrap pt-8 md:pt-12">
        <div className="frame px-5 py-9 md:px-12 md:py-14">
          <Reveal stagger onMount className="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <RevealItem>
                <TypeReveal className="label" text="Vol. I · 2026 · An open archive of debate" delay={0.2} />
              </RevealItem>
              <RevealItem>
                <h1 className="mt-4 text-[2.5rem] font-black sm:text-5xl md:text-6xl">
                  Where thought becomes{' '}
                  <span className="relative inline-block px-3 text-ivory">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-[12%] bottom-[2%] -rotate-1 bg-oxblood"
                      style={{ filter: 'url(#brush)' }}
                    />
                    <span className="relative italic">argument.</span>
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
                    Browse the motions <span aria-hidden="true">⟶</span>
                  </Link>
                </Pressable>
                <Link to="/articles" className="link-underline pb-0.5 font-bold text-oxblood">
                  Read the latest essay
                </Link>
              </RevealItem>
            </div>

            <RevealItem>
              <aside className="note mx-auto max-w-sm rotate-1 p-6 lg:mr-0" aria-label="Motion of the day">
                <p className="label">
                  <Sym name="pilcrow" className="mr-1.5" />
                  Motion of the day
                </p>
                <p className="mt-3 font-display text-[1.375rem] leading-snug font-bold">{motionOfDay.text}</p>
                <p className="meta mt-3">
                  {motionOfDay.format} · {motionOfDay.theme}
                </p>
                <hr className="rule-hair my-4" />
                <Link to="/motions" className="text-sm font-bold text-oxblood">
                  Start a 15-minute prep <span aria-hidden="true">⟶</span>
                </Link>
              </aside>
            </RevealItem>
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
          <Link to={`/articles/${lead.slug}`} className="group card block p-6 md:p-9">
            <Stamp className="max-w-full !whitespace-normal">Latest Ramz</Stamp>
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
                <Link to="/motions" className="group block py-4">
                  <p className="font-display text-lg leading-snug font-bold">
                    <span className="misreg" data-text={m.text}>
                      {m.text}
                    </span>
                  </p>
                  <p className="meta mt-1.5">
                    {m.format} · {m.theme} · {formatDate(m.date)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/motions" className="mt-4 inline-flex min-h-11 items-center font-bold text-oxblood">
            All motions <span aria-hidden="true" className="ml-1.5">⟶</span>
          </Link>
        </Reveal>

        <Reveal>
          <SectionHead symbol="section" title="Newest resources" purpose="Guides and casefiles to prepare with." />
          <ul>
            {resources.slice(0, 3).map((r) => (
              <li key={r.slug} className="border-b border-border-warm">
                <Link to="/resources" className="group block py-4">
                  <p className="font-display text-lg leading-snug font-bold">
                    <span className="misreg" data-text={r.title}>
                      {r.title}
                    </span>
                  </p>
                  <p className="mt-1 text-[0.9375rem] text-charcoal">{r.summary}</p>
                  <p className="meta mt-1.5">
                    {r.kind} · {formatDate(r.date)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/resources" className="mt-4 inline-flex min-h-11 items-center font-bold text-oxblood">
            All resources <span aria-hidden="true" className="ml-1.5">⟶</span>
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
            <p className="label !text-ivory/85">
              <Sym name="leaf" tone="gold" className="mr-1.5" />
              The Floor · Prompt of the week
            </p>
            <h2 id="floor-h" className="mt-4 max-w-3xl text-3xl font-bold italic md:text-[2.75rem]">
              “{weeklyPrompt.text}”
            </h2>
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
                  Take the floor <span aria-hidden="true">⟶</span>
                </Link>
              </Pressable>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- NEW HERE: site info, hidden for members ---------- */}
      {!user && (
        <section className="wrap mt-14" aria-labelledby="new-h">
          <Reveal>
            <div className="zone-info px-6 py-7 md:px-9">
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
          </Reveal>
        </section>
      )}
    </>
  )
}
