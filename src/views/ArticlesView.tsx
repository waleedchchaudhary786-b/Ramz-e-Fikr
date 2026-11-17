import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { Doodle, Reveal, RevealItem, StampIn, Stick } from '../utils/motion'
import { Pen, Scribble } from '../components/Doodles'
import { Link, useRouter } from '../utils/router'
import { Divider, Stamp, Sym } from '../components/Symbols'
import { Filter, Reaction } from '../components/Bits'
import { getArticleDetail, useArticles } from '../services/store'
import { useSession } from '../services/session'
import { Thread } from './FloorView'
import { PageHead } from './PlaceholderView'
import { formatDate, type Article } from '../data/sample'
import { wordCount } from '../data/articles'

const anchor = (text: string) => 's-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function ArticlesView() {
  const { path } = useRouter()
  const { user } = useSession()
  const articles = useArticles()
  const slug = path.split('/')[2]
  const [cat, setCat] = useState<string>('All')
  const article = articles.find((a) => a.slug === slug)
  if (slug && article) return <Reader a={article} all={articles} />
  if (slug)
    return (
      <>
        <PageHead symbol="dagger" title="Essay not found" purpose="That essay is not in the archive." />
        <div className="wrap mt-6">
          <Link to="/articles" className="font-bold text-oxblood">
            All articles <span className="arrow">⟶</span>
          </Link>
        </div>
      </>
    )

  return (
    <>
      <PageHead
        symbol="hand"
        title="Articles"
        purpose="Essays and opinion from debaters, each with one idea worth arguing about."
        note="Because an idea without a sentence is just noise."
      />
      <div className="wrap">
        <div className="mb-8">
          <Filter label="Shelf" options={[...new Set(articles.map((a) => a.category))]} value={cat} onChange={setCat} />
        </div>
        <Reveal stagger onMount key={cat} className="grid gap-8 md:grid-cols-2">
          {articles.filter((a) => cat === 'All' || a.category === cat).map((a, i) => (
            <RevealItem key={a.slug} className={i === 0 ? 'md:col-span-2' : ''}>
              <Link to={`/articles/${a.slug}`} className="group card flex h-full flex-col md:flex-row">
                <span className="flex shrink-0 items-center justify-between bg-oxblood px-5 py-2 text-ivory md:w-12 md:flex-col md:px-0 md:py-5">
                  <span className="font-mono text-xs tracking-[0.2em] uppercase md:rotate-180 md:whitespace-nowrap md:[writing-mode:vertical-rl]">
                    {a.category}
                  </span>
                  <span className="numeral text-xl" style={{ WebkitTextStroke: '1px var(--color-gold)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="block p-6 md:p-8">
                  <span className={`block font-display font-bold ${i === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                    <span className="misreg" data-text={a.title}>
                      {a.title}
                    </span>
                  </span>
                  <span className="measure mt-3 block font-display text-oxblood italic">
                    <Sym name="hand" className="mr-2 not-italic" />
                    {a.ramz}
                  </span>
                  <span className="measure mt-3 block text-charcoal">{a.excerpt}</span>
                  <span className="meta mt-4 block">
                    By {a.authorName} · {formatDate(a.date)} · {a.readMins} min read
                  </span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </Reveal>

        <Stick rest={-1} className="torn-wrap relative mt-14 max-w-xl">
          <span className="tape -top-2.5 left-10 z-10 -rotate-3" aria-hidden="true" />
          <div className="torn bg-parchment px-7 py-8">
            <p className="hand text-2xl text-oxblood">Got an argument of your own?</p>
            <p className="mt-1 text-[0.9375rem]">Write it up. An owner reads every submission before it is published.</p>
            <Link to={user ? '/write' : '/signin'} className="btn btn-primary mt-4">
              {user ? 'Open the writing studio' : 'Sign in to write'} <span aria-hidden="true" className="arrow">⟶</span>
            </Link>
          </div>
        </Stick>
      </div>
    </>
  )
}

function CopyLink() {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(window.location.href)
          .then(() => {
            setDone(true)
            window.setTimeout(() => setDone(false), 1800)
          })
          .catch(() => {})
      }}
      className="inline-flex min-h-11 items-center gap-2 border border-border-warm px-3 font-mono text-[0.8125rem] hover:border-oxblood"
    >
      {done ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
      {done ? 'Copied' : 'Copy link'}
    </button>
  )
}

function Reader({ a, all }: { a: Article; all: Article[] }) {
  const detail = getArticleDetail(a.slug)
  const blocks = detail?.blocks ?? [{ t: 'p' as const, text: a.excerpt }]
  const headings = blocks.filter((b) => b.t === 'h')
  const words = wordCount(blocks)
  const next = all[(all.indexOf(a) + 1) % all.length]
  let firstPara = true

  return (
    <article className="wrap pt-10 md:pt-14">
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_15rem] lg:gap-14">
        <div className="min-w-0">
          <Reveal stagger onMount>
            <RevealItem>
              <Link to="/articles" className="meta hover:text-oxblood">
                ⟵ All articles
              </Link>
              <p className="label mt-6">
                {a.category} · {formatDate(a.date)} · {a.readMins} min read
              </p>
            </RevealItem>
            <RevealItem>
              <h1 className="mt-3 text-4xl font-black md:text-[3.25rem]">{a.title}</h1>
              <p className="meta mt-4">
                By {a.authorName} · posted by {a.postedBy} · {words.toLocaleString()} words
              </p>
            </RevealItem>
            <RevealItem>
              <Stick rest={-1} delay={0.35} className="torn-wrap relative mt-9">
                <span className="tape -top-2.5 left-10 z-10 -rotate-3" aria-hidden="true" />
                <div className="torn bg-parchment px-7 py-8">
                  <StampIn delay={0.6}>
                    <Stamp>Latest Ramz</Stamp>
                  </StampIn>
                  <p className="mt-3 pr-10 font-display text-xl leading-snug text-oxblood italic md:text-2xl">{a.ramz}</p>
                  <Doodle className="absolute right-6 bottom-5 block text-ink" delay={0.8}>
                    <Pen size={40} />
                  </Doodle>
                </div>
              </Stick>
            </RevealItem>
          </Reveal>

          {detail && detail.brief.length > 0 && (
            <Reveal>
              <section className="mt-10 border-y border-ink/70 py-5" aria-labelledby="brief-h">
                <h2 id="brief-h" className="label !font-bold !text-ink">
                  In brief
                </h2>
                <ol className="mt-3 space-y-2">
                  {detail.brief.map((b, i) => (
                    <li key={b} className="flex gap-4">
                      <span className="numeral w-8 shrink-0 text-2xl" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span className="measure">{b}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>
          )}

          <div className="mt-9 text-[1.0625rem] leading-[1.8]">
            {blocks.map((b, i) => {
              if (b.t === 'h')
                return (
                  <Reveal key={i}>
                    <h2 id={anchor(b.text)} className="mt-10 scroll-mt-32 text-2xl font-bold md:text-[1.75rem]">
                      {b.text}
                    </h2>
                    <Scribble className="mt-1 block h-2.5 w-28 text-oxblood" />
                  </Reveal>
                )
              if (b.t === 'q')
                return (
                  <Reveal key={i}>
                    <blockquote className="relative my-9 pl-12 md:-mx-6 md:pl-16">
                      <span className="absolute top-[-0.6rem] left-0 font-display text-7xl leading-none text-gold md:text-8xl" aria-hidden="true">
                        “
                      </span>
                      <p className="font-display text-2xl leading-snug font-bold text-oxblood italic md:text-[1.75rem]">{b.text}</p>
                    </blockquote>
                  </Reveal>
                )
              if (b.t === 'ul')
                return (
                  <Reveal key={i}>
                    <ul className="my-5 space-y-2">
                      {b.items.map((it) => (
                        <li key={it} className="flex gap-3">
                          <Sym name="hand" className="shrink-0" />
                          <span className="measure">{it}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )
              const drop = firstPara
              firstPara = false
              return (
                <Reveal key={i}>
                  <p
                    className={`measure mt-5 ${
                      drop
                        ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:font-black first-letter:text-oxblood'
                        : ''
                    }`}
                  >
                    {b.text}
                  </p>
                </Reveal>
              )
            })}
          </div>

          {detail?.counter && (
            <Reveal>
              <section className="mt-12 border-l-[3px] border-oxblood bg-parchment/70 px-6 py-6" aria-labelledby="counter-h">
                <h2 id="counter-h" className="label !font-bold !text-ink">
                  <Sym name="dagger" className="mr-1.5" />
                  The other side
                </h2>
                <p className="measure mt-2 text-[1.0625rem] leading-[1.8]">{detail.counter}</p>
              </section>
            </Reveal>
          )}

          {detail?.questions && detail.questions.length > 0 && (
            <Reveal>
              <section className="mt-10" aria-labelledby="q-h">
                <h2 id="q-h" className="text-2xl font-bold">For your club to discuss</h2>
                <Scribble className="mt-1 block h-2.5 w-28 text-oxblood" />
                <ol className="mt-4 space-y-3">
                  {detail.questions.map((q, i) => (
                    <li key={q} className="flex gap-4">
                      <span className="numeral w-8 shrink-0 text-2xl" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span className="measure text-[1.0625rem]">{q}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>
          )}

          {detail?.terms && detail.terms.length > 0 && (
            <p className="meta mt-8">
              Terms used in this essay:{' '}
              {detail.terms.map((t, i) => (
                <span key={t}>
                  {i > 0 && ' · '}
                  <Link to="/glossary" className="font-bold text-oxblood underline underline-offset-2">
                    {t}
                  </Link>
                </span>
              ))}
            </p>
          )}

          {detail && detail.inARound.length > 0 && (
            <Stick rest={0.8} className="torn-wrap relative mt-12">
              <span className="tape -top-2.5 right-10 z-10 rotate-6" aria-hidden="true" />
              <section className="torn bg-parchment px-7 py-9" aria-labelledby="round-h">
                <h2 id="round-h" className="hand text-3xl text-oxblood">
                  Try it in your next round
                </h2>
                <ol className="mt-3 space-y-2">
                  {detail.inARound.map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="font-mono font-bold text-oxblood">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </Stick>
          )}

          {detail?.note && (
            <p className="meta mt-8">
              <Sym name="dagger" className="mr-1.5" />
              {detail.note}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <Reaction kind="like" itemKey={`article:${a.slug}`} base={a.slug.startsWith('u-') ? 0 : 12} />
            <Reaction kind="bookmark" itemKey={`article:${a.slug}`} />
            <CopyLink />
          </div>

          {detail && (
            <div className="mt-8 flex items-start gap-4 border-t border-border-warm pt-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center bg-oxblood font-display text-xl font-bold text-ivory" aria-hidden="true">
                {a.authorName[0]}
              </span>
              <p className="text-[0.9375rem]">
                <strong className="block font-display text-lg">{a.authorName}</strong>
                <span className="text-charcoal">{detail.bio}</span>
              </p>
            </div>
          )}

          <Divider className="my-12" />

          <section aria-labelledby="disc-h">
            <h2 id="disc-h" className="text-2xl font-bold">
              <Sym name="leaf" className="mr-2" />
              Argue back
            </h2>
            <p className="meta mt-1">This thread also appears on The Floor.</p>
            <Thread thread={`article-${a.slug}`} />
          </section>

          <Link to={`/articles/${next.slug}`} className="group card mt-12 block p-6">
            <span className="label">Next essay</span>
            <span className="mt-1 block font-display text-2xl font-bold">
              {next.title} <span className="arrow text-oxblood">⟶</span>
            </span>
          </Link>
        </div>

        {/* contents, pinned beside the essay on wide screens */}
        {headings.length > 0 && (
          <aside className="hidden lg:block" aria-label="In this essay">
            <div className="sticky top-32 border-l border-oxblood/50 pl-5">
              <p className="label !font-bold !text-ink">In this essay</p>
              <ol className="mt-3 space-y-2.5">
                {headings.map((h, i) => (
                  <li key={h.text} className="flex gap-2 text-[0.9375rem] leading-snug">
                    <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, '0')}</span>
                    <a
                      href={'#' + anchor(h.text)}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(anchor(h.text))?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="hover:text-oxblood"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="hand mt-6 -rotate-2 text-xl text-oxblood">read it, then argue back ↓</p>
            </div>
          </aside>
        )}
      </div>
    </article>
  )
}
