import { Reveal, RevealItem, StampIn } from '../utils/motion'
import { Link, useRouter } from '../utils/router'
import { Divider, Stamp, Sym } from '../components/Symbols'
import { Reaction } from '../components/Bits'
import { Thread } from './FloorView'
import { PageHead } from './PlaceholderView'
import { articleBodies, articles, formatDate } from '../data/sample'

export default function ArticlesView() {
  const { path } = useRouter()
  const slug = path.split('/')[2]
  const article = articles.find((a) => a.slug === slug)
  if (slug && article) return <Reader slug={slug} />
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
      <PageHead symbol="hand" title="Articles" purpose="Essays and opinion from debaters, each with one idea worth arguing about." />
      <div className="wrap">
        <Reveal stagger onMount className="grid gap-8 md:grid-cols-2">
          {articles.map((a, i) => (
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
      </div>
    </>
  )
}

function Reader({ slug }: { slug: string }) {
  const a = articles.find((x) => x.slug === slug)!
  const body = articleBodies[slug] ?? [a.excerpt]
  const next = articles[(articles.indexOf(a) + 1) % articles.length]
  return (
    <article className="wrap pt-10 md:pt-14">
      <div className="mx-auto max-w-[70ch]">
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
              By {a.authorName} · posted by {a.postedBy}
            </p>
          </RevealItem>
          <RevealItem>
            <div className="mt-8 border-y border-ink/70 py-5">
              <StampIn delay={0.5}>
                <Stamp>Latest Ramz</Stamp>
              </StampIn>
              <p className="mt-3 font-display text-xl leading-snug text-oxblood italic md:text-2xl">
                <Sym name="hand" className="mr-2 not-italic" />
                {a.ramz}
              </p>
            </div>
          </RevealItem>
        </Reveal>

        <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.8]">
          {body.map((p, i) => (
            <Reveal key={i}>
              <p className={i === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:font-black first-letter:text-oxblood' : ''}>
                {p}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Reaction kind="like" itemKey={`article:${slug}`} base={12} />
          <Reaction kind="bookmark" itemKey={`article:${slug}`} />
        </div>

        <Divider className="my-12" />

        <section aria-labelledby="disc-h">
          <h2 id="disc-h" className="text-2xl font-bold">
            <Sym name="leaf" className="mr-2" />
            Argue back
          </h2>
          <p className="meta mt-1">This thread also appears on The Floor.</p>
          <Thread thread={`article-${slug}`} />
        </section>

        <Link to={`/articles/${next.slug}`} className="group card mt-12 block p-6">
          <span className="label">Next essay</span>
          <span className="mt-1 block font-display text-2xl font-bold">
            {next.title} <span className="arrow text-oxblood">⟶</span>
          </span>
        </Link>
      </div>
    </article>
  )
}
