import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion, Reveal, Sweep, WordReveal } from '../utils/motion'
import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { actions, findBlocked, timeAgo, useStore, type Stance } from '../services/store'
import { Fold, Tabs } from '../components/Bits'
import { Sym } from '../components/Symbols'
import { Scribble, Star } from '../components/Doodles'
import { PageHead } from './PlaceholderView'
import { articles, pastPrompts, weeklyPrompt } from '../data/sample'

const STANCES: Stance[] = ['For', 'Against', 'Unsure']

/** A discussion thread: replies, plus a composer for signed-in members. */
export function Thread({ thread, withStance = false }: { thread: string; withStance?: boolean }) {
  const { user } = useSession()
  const { posts } = useStore()
  const list = posts.filter((p) => p.thread === thread)
  const [text, setText] = useState('')
  const [stance, setStance] = useState<Stance>('Unsure')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const blocked = findBlocked(text)
  const blockedEdit = findBlocked(draft)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !text.trim() || blocked) return
    actions.addPost({ thread, author: user.name, text: text.trim(), stance: withStance ? stance : undefined })
    setText('')
  }

  return (
    <div className="mt-5">
      <ul>
        <AnimatePresence initial={false}>
          {list.map((p) => {
            const mine = user?.name === p.author
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: DUR.base, ease: EASE_SNAP }}
                className="border-b border-border-warm py-4"
              >
                <p className="meta">
                  <strong className="font-bold text-ink">{p.author}</strong>
                  {p.stance && <span className="text-oxblood"> · {p.stance}</span>} · {timeAgo(p.at)}
                  {p.editedAt && <span> · edited {timeAgo(p.editedAt)}</span>}
                </p>
                {editing === p.id ? (
                  <div className="mt-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      aria-label="Edit your reply"
                      className="block w-full border border-border-warm bg-white/60 p-3 focus:border-oxblood focus:outline-none"
                    />
                    {blockedEdit && <p className="mt-1 text-sm text-oxblood">Please rephrase: “{blockedEdit}” is not allowed here.</p>}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={!draft.trim() || !!blockedEdit}
                        onClick={() => {
                          actions.editPost(p.id, draft.trim())
                          setEditing(null)
                        }}
                        className="btn btn-primary disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="measure mt-1.5">{p.text}</p>
                )}
                {mine && editing !== p.id && (
                  <p className="mt-1 flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p.id)
                        setDraft(p.text)
                      }}
                      className="min-h-11 font-mono text-[0.8125rem] text-oxblood underline underline-offset-2"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.deletePost(p.id)}
                      className="min-h-11 font-mono text-[0.8125rem] text-charcoal underline underline-offset-2"
                    >
                      Delete
                    </button>
                  </p>
                )}
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
      {list.length === 0 && <p className="meta py-4">No replies yet. Be the first.</p>}

      {user ? (
        <form onSubmit={submit} className="mt-5">
          <label className="block">
            <span className="label">Your reply, as {user.name}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={1200}
              placeholder="Make your case…"
              className="mt-1 block w-full border border-border-warm bg-white/60 p-3 focus:border-oxblood focus:outline-none"
            />
          </label>
          {blocked && (
            <p className="mt-1 text-sm text-oxblood" role="alert">
              Please rephrase: “{blocked}” is not allowed here. Argue the point, not the person.
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {withStance && (
              <span className="mr-2 flex gap-1" role="group" aria-label="Your stance">
                {STANCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={stance === s}
                    onClick={() => setStance(s)}
                    className={`min-h-11 border px-3 font-mono text-[0.8125rem] ${
                      stance === s ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </span>
            )}
            <button type="submit" disabled={!text.trim() || !!blocked} className="btn btn-primary disabled:opacity-50">
              Post reply <span aria-hidden="true" className="arrow">⟶</span>
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 border border-border-warm bg-parchment p-4 text-[0.9375rem]">
          <Link to="/signin" className="font-bold text-oxblood underline underline-offset-2">
            Sign in
          </Link>{' '}
          to reply. Reading is open to everyone.
        </p>
      )}
    </div>
  )
}

export default function FloorView() {
  const [tab, setTab] = useState<'open' | 'articles'>('open')
  const { posts } = useStore()
  const count = (t: string) => posts.filter((p) => p.thread === t).length
  const threads = articles
    .map((a) => ({ a, n: count(`article-${a.slug}`), last: Math.max(0, ...posts.filter((p) => p.thread === `article-${a.slug}`).map((p) => p.at)) }))
    .sort((x, y) => y.last - x.last)

  return (
    <>
      <PageHead symbol="leaf" title="The Floor" purpose="Where readers argue back: discuss our articles, or take the week's open prompt." />
      <div className="wrap max-w-4xl">
        <Tabs
          id="floor"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'open', label: 'Open Floor' },
            { value: 'articles', label: 'Article Discussions' },
          ]}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, x: tab === 'open' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_SNAP }}
            className="pt-8"
          >
            {tab === 'open' ? (
              <>
                <div className="relative bg-oxblood px-6 py-9 text-ivory md:px-10 md:py-12">
                  <div className="pointer-events-none absolute inset-2 border border-gold/60" aria-hidden="true" />
                  <span className="absolute top-6 right-7 hidden text-gold sm:block" aria-hidden="true">
                    <Star size={28} />
                  </span>
                  <p className="label !text-ivory/85">Prompt of the week · {weeklyPrompt.week}</p>
                  <h2 className="mt-3 max-w-2xl text-3xl font-bold italic md:text-4xl">
                    <WordReveal text={`“${weeklyPrompt.text}”`} />
                  </h2>
                  <Sweep className="mt-3 block h-3 w-48 text-gold" delay={0.4}>
                    <Scribble className="h-full w-full" />
                  </Sweep>
                  <p className="mt-3 font-mono text-[0.8125rem] text-ivory/85">A new prompt goes up every Monday.</p>
                </div>
                <Thread thread="prompt" withStance />

                <section className="mt-12" aria-labelledby="past-h">
                  <h2 id="past-h" className="label !font-bold !text-ink">
                    Past prompts
                  </h2>
                  {pastPrompts.map((p) => (
                    <Fold key={p.week} summary={<span className="font-display text-lg font-bold italic">“{p.text}”</span>}>
                      <p className="meta">{p.week} · closed for new replies</p>
                    </Fold>
                  ))}
                </section>
              </>
            ) : (
              <>
                <p className="measure text-charcoal">Every published essay gets a thread here. Most recently active first.</p>
                <div className="mt-4">
                  {threads.map(({ a, n }, i) => (
                    <Reveal key={a.slug}>
                      <Fold
                        defaultOpen={i === 0}
                        summary={
                          <span>
                            <span className="block font-display text-xl font-bold">
                              <Sym name="hand" className="mr-2" />
                              {a.title}
                            </span>
                            <span className="meta mt-1 block">
                              {n} {n === 1 ? 'reply' : 'replies'} · by {a.authorName}
                            </span>
                          </span>
                        }
                      >
                        <Link to={`/articles/${a.slug}`} className="text-sm font-bold text-oxblood">
                          Read the essay <span className="arrow">⟶</span>
                        </Link>
                        <Thread thread={`article-${a.slug}`} />
                      </Fold>
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
