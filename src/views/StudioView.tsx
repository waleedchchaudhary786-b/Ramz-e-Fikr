/* The writing studio: draft, autosave, submit for review.
   Review (approve / return with a note) lives on the owner's dashboard. */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion, StampIn, Stick } from '../utils/motion'
import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { actions, timeAgo, useStore, type Draft, type DraftStatus } from '../services/store'
import { toBlocks, wordCount } from '../data/articles'
import { Stamp, Sym } from '../components/Symbols'
import { PageHead } from './PlaceholderView'

const STATUS_LABEL: Record<DraftStatus, string> = {
  draft: 'Draft',
  pending: 'With the desk',
  approved: 'Published',
  rejected: 'Returned',
}
export function StatusStamp({ status }: { status: DraftStatus }) {
  return (
    <StampIn key={status} delay={0}>
      <Stamp className={status === 'approved' ? '' : status === 'draft' ? '!border-charcoal !text-charcoal' : ''}>
        {STATUS_LABEL[status]}
      </Stamp>
    </StampIn>
  )
}

const RAMZ_MAX = 140
const blank = { title: '', authorName: '', ramz: '', body: '' }

export default function StudioView() {
  const { user } = useSession()
  const { drafts } = useStore()
  const [id, setId] = useState<string | undefined>()
  const [form, setForm] = useState(blank)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const dirty = useRef(false)

  // autosave a moment after typing stops
  useEffect(() => {
    if (!user || !dirty.current) return
    if (!form.title.trim() && !form.body.trim()) return
    const t = window.setTimeout(() => {
      const newId = actions.saveDraft({ id, ...form, postedBy: user.name })
      setId(newId)
      setSavedAt(Date.now())
      dirty.current = false
    }, 700)
    return () => window.clearTimeout(t)
  }, [form, id, user])

  if (!user)
    return (
      <>
        <PageHead info symbol="hand" title="Writing studio" purpose="Draft an essay and send it to the desk for review." />
        <div className="wrap pt-8">
          <Link to="/signin" className="btn btn-primary">
            Sign in to write
          </Link>
        </div>
      </>
    )

  const mine = drafts.filter((d) => d.postedBy === user.name)
  const current = mine.find((d) => d.id === id)
  const locked = current?.status === 'pending' || current?.status === 'approved'
  const words = wordCount(toBlocks(form.body))
  const ready = form.title.trim().length > 3 && form.ramz.trim().length > 10 && words >= 60
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dirty.current = true
    setForm((f) => ({ ...f, [k]: e.target.value }))
  }
  const open = (d: Draft) => {
    setId(d.id)
    setForm({ title: d.title, authorName: d.authorName, ramz: d.ramz, body: d.body })
    setSavedAt(d.updatedAt)
    window.scrollTo({ top: 0 })
  }
  const fresh = () => {
    setId(undefined)
    setForm(blank)
    setSavedAt(null)
  }

  return (
    <>
      <PageHead
        info
        symbol="hand"
        title="Writing studio"
        purpose="Draft an essay and send it to the desk. It saves as you type."
        note="Midnight rewrites welcome."
      />
      <div className="wrap grid gap-12 pt-8 lg:grid-cols-[1fr_20rem]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!ready || locked) return
            const newId = actions.saveDraft({ id, ...form, postedBy: user.name })
            actions.setDraftStatus(newId, 'pending')
            setId(newId)
          }}
          className="min-w-0"
        >
          {current && (
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <StatusStamp status={current.status} />
              {current.status === 'rejected' && current.note && (
                <p className="text-[0.9375rem]">
                  <strong>Note from the desk:</strong> {current.note}
                </p>
              )}
              {locked && <p className="meta">This essay is locked while it is {STATUS_LABEL[current.status].toLowerCase()}.</p>}
            </div>
          )}
          <fieldset disabled={locked} className="space-y-6 disabled:opacity-70">
            <label className="block">
              <span className="label">Title</span>
              <input value={form.title} onChange={set('title')} maxLength={110} className="paper-input mt-1 !font-display !text-2xl !font-bold" placeholder="Your headline" />
            </label>
            <label className="block">
              <span className="label">Author name, if not you (guest authors are credited)</span>
              <input value={form.authorName} onChange={set('authorName')} maxLength={60} className="paper-input mt-1" placeholder={user.name} />
            </label>
            <label className="block">
              <span className="label flex justify-between">
                <span>Latest Ramz: the one idea, in one sentence</span>
                <span className={form.ramz.length > RAMZ_MAX - 15 ? '!text-oxblood' : ''}>
                  {form.ramz.length}/{RAMZ_MAX}
                </span>
              </span>
              <input value={form.ramz} onChange={set('ramz')} maxLength={RAMZ_MAX} className="paper-input mt-1" placeholder="The sentence a reader should leave with" />
            </label>
            <label className="block">
              <span className="label flex justify-between">
                <span>Essay</span>
                <span>{words} words</span>
              </span>
              <textarea value={form.body} onChange={set('body')} rows={16} className="paper-area mt-1 !font-sans" placeholder={'Start writing…\n\n## A line starting with two hashes becomes a sub-heading\n\n> A line starting with > becomes a pull quote'} />
            </label>
          </fieldset>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={!ready || locked} className="btn btn-primary disabled:opacity-50">
              Send to the desk <span aria-hidden="true" className="arrow">⟶</span>
            </button>
            <button type="button" onClick={fresh} className="btn btn-ghost">
              New essay
            </button>
            <p className="meta" aria-live="polite">
              {savedAt ? `Saved ${timeAgo(savedAt)}` : 'Not saved yet'}
            </p>
          </div>
          {!ready && !locked && <p className="meta mt-2">Needs a title, a Ramz and at least 60 words before it can be sent.</p>}
        </form>

        <aside className="space-y-10">
          <Stick rest={1.2} className="torn-wrap relative">
            <span className="tape -top-2.5 right-8 z-10 rotate-6" aria-hidden="true" />
            <div className="torn bg-ivory px-6 py-8">
              <p className="label">How the card will look</p>
              <Stamp className="mt-3">Latest Ramz</Stamp>
              <p className="mt-3 font-display text-lg leading-snug text-oxblood italic">
                <Sym name="hand" className="mr-2 not-italic" />
                {form.ramz || 'Your one-sentence idea appears here as you type.'}
              </p>
              <p className="mt-3 font-display text-xl leading-tight font-bold">{form.title || 'Your headline'}</p>
              <p className="meta mt-2">By {form.authorName || user.name}</p>
            </div>
          </Stick>

          <section>
            <h2 className="label !font-bold !text-ink">Your essays · {mine.length}</h2>
            <ul className="mt-2">
              <AnimatePresence initial={false}>
                {mine.map((d) => (
                  <motion.li
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.base, ease: EASE_SNAP }}
                    className="border-b border-border-warm py-3"
                  >
                    <button type="button" onClick={() => open(d)} className="block w-full text-left">
                      <span className="block font-display text-lg leading-snug font-bold">{d.title || 'Untitled'}</span>
                      <span className="meta mt-1 block">
                        {STATUS_LABEL[d.status]} · {timeAgo(d.updatedAt)}
                      </span>
                    </button>
                    {d.status === 'approved' && (
                      <Link to={`/articles/u-${d.id}`} className="text-sm font-bold text-oxblood">
                        Read it live <span className="arrow">⟶</span>
                      </Link>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {mine.length === 0 && <p className="meta mt-3">Nothing yet. Your drafts will be listed here.</p>}
          </section>
        </aside>
      </div>
    </>
  )
}

/** Owner-only: essays waiting for a decision. */
export function ReviewQueue() {
  const { drafts } = useStore()
  const pending = drafts.filter((d) => d.status === 'pending')
  const [notes, setNotes] = useState<Record<string, string>>({})
  return (
    <section className="mt-10 border-t-2 border-oxblood pt-3">
      <h2 className="label !font-bold !text-ink">Owner tools · essays awaiting review · {pending.length}</h2>
      {pending.length === 0 && <p className="meta mt-3">Nothing is waiting. Submitted essays appear here.</p>}
      <ul className="mt-3 grid gap-6 md:grid-cols-2">
        <AnimatePresence>
          {pending.map((d) => (
            <motion.li key={d.id} layout exit={{ opacity: 0, scale: 0.96 }} className="card p-5">
              <p className="font-display text-xl font-bold">{d.title}</p>
              <p className="meta mt-1">
                By {d.authorName || d.postedBy} · posted by {d.postedBy} · {wordCount(toBlocks(d.body))} words
              </p>
              <p className="mt-2 font-display text-oxblood italic">{d.ramz}</p>
              <p className="mt-2 line-clamp-3 text-[0.9375rem] text-charcoal">{d.body}</p>
              <input
                value={notes[d.id] ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))}
                placeholder="Note to the author (needed to return it)"
                aria-label="Note to the author"
                className="paper-input mt-3"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => actions.setDraftStatus(d.id, 'approved')} className="btn btn-primary">
                  Approve and publish
                </button>
                <button
                  type="button"
                  disabled={!(notes[d.id] ?? '').trim()}
                  onClick={() => actions.setDraftStatus(d.id, 'rejected', notes[d.id].trim())}
                  className="btn btn-ghost disabled:opacity-50"
                >
                  Return with note
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="meta mt-4">Moderation of replies, and team management, arrive with real accounts.</p>
    </section>
  )
}
