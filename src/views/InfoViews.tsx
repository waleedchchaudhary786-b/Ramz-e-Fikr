/* Site-info pages: About (with the user guide), The Desk, Dashboard. */
import { Reveal, Stick } from '../utils/motion'
import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { useStore, timeAgo } from '../services/store'
import { Fold } from '../components/Bits'
import { Divider, Sym } from '../components/Symbols'
import { FrameCorners } from '../components/Doodles'
import { PageHead } from './PlaceholderView'
import { allMotions, allResources, articles } from '../data/sample'

const GUIDE: [string, string][] = [
  ['Reading and finding things', 'Everything is free to read without an account. The strip under the header shows the newest motions and essays: hover to stop it, hold to speed it up, click an item to open it.'],
  ['Motions and the prep timer', 'On Motions, filter by format, search by topic, or pick a day on the calendar (days with a gold dot have new motions). "Draw a random motion" deals you one; "Start prep" runs a 7, 15 or 30 minute countdown.'],
  ['Resources and the Glossary', 'Resources are filed like catalogue cards: choose a drawer to narrow them. The Glossary explains debate terms in English and Urdu.'],
  ['The Floor', 'Two rooms. Open Floor has one prompt each week, where you can reply For, Against or Unsure. Article Discussions has one thread per essay.'],
  ['Replying and editing', 'Sign in to reply. You can edit or delete your own replies at any time; edited replies are marked as edited.'],
  ['Your dashboard', 'Once signed in, "My Dashboard" appears beside the logo. It lists what you liked, what you saved and what you wrote.'],
  ['What gets moderated', 'Insults and abusive language are stopped before posting. Argue the point, not the person. Anything held is reviewed by an owner, not silently deleted.'],
]

export function AboutView() {
  return (
    <>
      <PageHead info symbol="fe" title="About" purpose="What Ramz-e-Fikr is, how the site works, and a guide to using it."
        note="New city. Same mission. Bigger community."
      />
      <div className="wrap max-w-3xl pt-8">
        <Reveal className="frame relative bg-ivory px-6 py-8 md:px-10">
          <FrameCorners />
          <h2 className="text-2xl font-bold">Our mission</h2>
          <p className="measure mt-3 text-[1.0625rem] leading-[1.8]">
            Ramz-e-Fikr is an open archive of debate resources, kept by students. We collect motions, write guides and
            publish essays so that anyone, in any city and at any school, can learn to turn a thought into an argument.
          </p>
          <p className="urdu mt-4 text-2xl text-oxblood" lang="ur">
            جہاں سوچ دلیل بنتی ہے۔
          </p>
        </Reveal>

        <Divider className="my-10" />

        <section id="guide" className="scroll-mt-32">
          <Reveal>
            <h2 className="text-2xl font-bold">
              <Sym name="hand" className="mr-2" />
              User guide
            </h2>
            <p className="meta mt-1">Seven short answers. Open the one you need.</p>
            <div className="mt-4">
              {GUIDE.map(([q, a], i) => (
                <Fold key={q} defaultOpen={i === 0} summary={<span className="font-display text-lg font-bold">{q}</span>}>
                  <p className="measure text-charcoal">{a}</p>
                </Fold>
              ))}
            </div>
          </Reveal>
        </section>

        <Divider className="my-10" />

        <Reveal>
          <h2 className="text-2xl font-bold">Roles, explained</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ['Member', 'Replies, likes, saves, and can submit an essay for review.'],
              ['Editor', 'Everything a member can do, plus writing and drafting essays.'],
              ['Owner', 'Approves essays and looks after moderation and the team.'],
            ].map(([r, d]) => (
              <div key={r} className="border-t-2 border-oxblood pt-3">
                <dt className="label !font-bold !text-ink">{r}</dt>
                <dd className="mt-1 text-[0.9375rem] text-charcoal">{d}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </>
  )
}

export function DeskView() {
  const steps = ['You send a draft', 'An editor reads it', 'An owner approves or returns it with a note', 'It is published with your name']
  return (
    <>
      <PageHead info symbol="dagger" title="The Desk" purpose="Who runs the publication, how to submit, and how approval works."
        note="More drafts than we can count."
      />
      <div className="wrap max-w-3xl pt-8">
        <Reveal>
          <h2 className="text-2xl font-bold">Masthead</h2>
          <p className="meta mt-1">Vol. I · 2026 · Lahore · Faisalabad</p>
          <p className="measure mt-3">
            The Publication Team edits every essay and guide on this site. Names are added here once the three owners
            are set.
          </p>
        </Reveal>
        <Divider className="my-10" />
        <section id="submit" className="scroll-mt-32">
          <Reveal>
            <h2 className="text-2xl font-bold">Submit an essay</h2>
            <p className="measure mt-3">
              We take essays of 600 to 1,500 words on debating, argument and public reasoning, in English or Urdu.
              Lead with one clear idea: it becomes the essay's “Latest Ramz”.
            </p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s} className="relative border-t border-ink/70 pt-3">
                  <span className="numeral block text-4xl" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-2 block text-[0.9375rem]">{s}</span>
                </li>
              ))}
            </ol>
            <p className="meta mt-6">The writing studio opens with accounts, in the next phase.</p>
          </Reveal>
        </section>
        <Divider className="my-10" />
        <Reveal>
          <h2 className="text-2xl font-bold">Editorial standards</h2>
          <ul className="mt-3 space-y-2">
            {['Claims carry sources.', 'The strongest version of the other side is stated fairly.', 'Corrections are marked with a † and dated.'].map((s) => (
              <li key={s} className="flex gap-3">
                <Sym name="hand" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </>
  )
}

function titleFor(key: string): { label: string; to: string } {
  const [kind, slug] = key.split(':')
  if (kind === 'article') return { label: articles.find((a) => a.slug === slug)?.title ?? slug, to: `/articles/${slug}` }
  if (kind === 'motion') return { label: allMotions.find((m) => m.slug === slug)?.text ?? slug, to: '/motions' }
  return { label: allResources.find((r) => r.slug === slug)?.title ?? slug, to: '/resources' }
}

export function DashboardView() {
  const { user, signOut } = useSession()
  const store = useStore()

  if (!user)
    return (
      <>
        <PageHead info symbol="fe" title="My Dashboard" purpose="Your activity, likes, saves and replies in one place." />
        <div className="wrap pt-8">
          <Link to="/signin" className="btn btn-primary">
            Sign in to see your dashboard
          </Link>
        </div>
      </>
    )

  const mine = store.posts.filter((p) => p.author === user.name).sort((a, b) => b.at - a.at)
  const Section = ({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) => (
    <section className="border-t-2 border-oxblood pt-3">
      <h2 className="label !font-bold !text-ink">
        {title} · {children.length}
      </h2>
      {children.length ? <ul className="mt-2">{children}</ul> : <p className="meta mt-3">{empty}</p>}
    </section>
  )
  const row = (key: string) => {
    const t = titleFor(key)
    return (
      <li key={key} className="border-b border-border-warm">
        <Link to={t.to} className="flex min-h-11 items-center justify-between gap-3 py-2 hover:text-oxblood">
          <span>{t.label}</span>
          <span className="arrow text-oxblood">⟶</span>
        </Link>
      </li>
    )
  }

  return (
    <>
      <PageHead info symbol="fe" title="My Dashboard" purpose="Your activity, likes, saves and replies in one place." />
      <div className="wrap pt-8">
        <Stick rest={-0.6} className="torn-wrap relative mb-10 max-w-md">
          <span className="tape -top-2.5 left-8 z-10 -rotate-3" aria-hidden="true" />
          <div className="torn bg-ivory px-6 py-7">
            <p className="label">Signed in as</p>
            <p className="font-display text-2xl font-bold">{user.name}</p>
            <p className="meta capitalize">Role · {user.role}</p>
            <button type="button" onClick={signOut} className="mt-2 min-h-11 font-mono text-[0.8125rem] text-oxblood underline underline-offset-2">
              Sign out
            </button>
          </div>
        </Stick>

        <div className="grid gap-10 md:grid-cols-3">
          <Section title="Liked" empty="Nothing liked yet.">
            {store.likes.map(row)}
          </Section>
          <Section title="Saved" empty="Nothing saved yet. Use Save on a motion or resource.">
            {store.bookmarks.map(row)}
          </Section>
          <Section title="Your replies" empty="You have not replied on the Floor yet.">
            {mine.map((p) => (
              <li key={p.id} className="border-b border-border-warm py-2">
                <p className="line-clamp-2 text-[0.9375rem]">{p.text}</p>
                <p className="meta">{timeAgo(p.at)}</p>
              </li>
            ))}
          </Section>
        </div>

        {user.role !== 'member' && (
          <section className="mt-10 border-t-2 border-oxblood pt-3">
            <h2 className="label !font-bold !text-ink">Drafts and submissions</h2>
            <p className="meta mt-3">The writing studio arrives with accounts, in the next phase.</p>
          </section>
        )}
        {user.role === 'owner' && (
          <section className="mt-10 border-t-2 border-oxblood pt-3">
            <h2 className="label !font-bold !text-ink">Owner tools</h2>
            <p className="meta mt-3">Moderation · Manage · Team. Visible to owners only; built in the next phase.</p>
          </section>
        )}
      </div>
    </>
  )
}
