/* Numbered sources list for essays and resources, plus inline [n] markers. */
import { Fragment, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { sources } from '../data/sources'
import { Reveal } from '../utils/motion'

/* The router uses the URL hash, so markers scroll with JS instead of #anchors. */
function jump(n: string) {
  const el = document.getElementById('src-' + n)
  if (!el) return
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
  el.classList.remove('src-flash')
  void el.offsetWidth
  el.classList.add('src-flash')
}

/** Turn "[1][2]" in plain text into small clickable reference markers. */
export function withRefs(text: string): ReactNode {
  const parts = text.split(/(\s?\[\d+\])/g)
  if (parts.length === 1) return text
  return parts.map((p, i) => {
    const m = p.match(/\[(\d+)\]/)
    if (!m) return <Fragment key={i}>{p}</Fragment>
    return (
      <sup key={i} className="ml-px">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            jump(m[1])
          }}
          className="inline-block px-0.5 py-0.5 font-mono text-[0.7rem] leading-none font-bold text-oxblood hover:underline"
          aria-label={`Source ${m[1]}`}
        >
          [{m[1]}]
        </button>
      </sup>
    )
  })
}

export function SourcesList({ slug }: { slug: string }) {
  const set = sources[slug]
  if (!set) return null
  return (
    <Reveal>
      <section className="mt-12 border-t-2 border-ink pt-4" aria-labelledby="sources-h">
        <h2 id="sources-h" className="label !font-bold !text-ink">
          Sources
        </h2>
        {set.basis && <p className="measure mt-2 text-[0.9375rem] leading-[1.55rem] text-charcoal italic">{set.basis}</p>}
        {set.list.length > 0 && (
          <ol className="mt-4 space-y-4">
            {set.list.map((s, i) => (
              <li key={s.url} id={`src-${i + 1}`} className="flex gap-4 rounded-sm px-2 py-1 -mx-2 transition-colors">
                <span className="numeral w-7 shrink-0 text-xl leading-6 text-oxblood">{i + 1}</span>
                <span className="min-w-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-[1.0625rem] font-bold break-words underline decoration-oxblood/40 underline-offset-2 hover:decoration-oxblood"
                  >
                    {s.title}
                    <ExternalLink aria-hidden="true" className="ml-1 inline h-3.5 w-3.5 align-baseline text-oxblood" />
                  </a>
                  <span className="meta mt-0.5 block">
                    {s.publisher}
                    {s.year ? ` · ${s.year}` : ''}
                  </span>
                  <span className="mt-1 block text-[0.9375rem] leading-[1.5rem] text-charcoal">
                    <span className="font-bold text-ink">Used for: </span>
                    {s.usedFor}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Reveal>
  )
}
