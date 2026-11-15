import { Doodle, Reveal, Stick, Sweep, TypeReveal, WordReveal } from '../utils/motion'
import { Sparks, Star } from '../components/Doodles'
import { Link } from '../utils/router'
import { useSession, type Role } from '../services/session'
import { Sym, type SymbolName } from '../components/Symbols'

/* Every page gets a title and a one-line purpose. Pages not built yet
   show this shell so navigation and transitions can be reviewed. */
export function PageHead({
  symbol,
  title,
  purpose,
  info = false,
  note,
}: {
  symbol: SymbolName
  title: string
  purpose: string
  info?: boolean
  /** a short line for the taped note beside the title */
  note?: string
}) {
  return (
    <header className={info ? 'zone-info' : ''}>
      <div className="wrap relative pt-10 pb-10 md:pt-14">
        <Doodle className="absolute top-8 right-6 hidden text-ink sm:block" delay={0.5}>
          <Star size={26} />
        </Doodle>
        <Doodle className="absolute top-16 right-16 hidden text-gold sm:block" delay={0.6}>
          <Star size={16} />
        </Doodle>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="min-w-0">
            <p>
              <TypeReveal className="label" text={info ? 'Site information' : 'The archive'} />
            </p>
            {/* the title sits on a brush stroke, as on the posters */}
            <h1 className="relative mt-3 inline-block px-4 py-1 text-4xl font-black text-ivory md:px-5 md:text-5xl">
              <Sweep className="absolute inset-0 block -rotate-1 bg-oxblood [filter:url(#brush)]" delay={0.1} />
              <span className="relative">
                <Sym name={symbol} tone="inherit" className="mr-3 text-gold" />
                <WordReveal text={title} delay={0.25} />
              </span>
              <Doodle className="absolute -top-5 -right-8 block text-oxblood" delay={0.7}>
                <Sparks size={28} style={{ transform: 'rotate(150deg)' }} />
              </Doodle>
            </h1>
            <p className="measure mt-5 text-lg text-charcoal">{purpose}</p>
          </div>
          {note && (
            <Stick rest={2} delay={0.4} className="torn-wrap relative mr-6 hidden w-60 md:block">
              <span className="tape -top-2.5 right-8 z-10 rotate-6" aria-hidden="true" />
              <p className="torn bg-parchment px-5 py-6 font-display text-[1.0625rem] leading-snug text-oxblood italic" style={info ? { background: 'var(--color-ivory)' } : undefined}>
                {note}
              </p>
            </Stick>
          )}
        </div>
      </div>
    </header>
  )
}

export default function PlaceholderView(props: {
  symbol: SymbolName
  title: string
  purpose: string
  info?: boolean
  phase: string
}) {
  return (
    <>
      <PageHead {...props} />
      <div className="wrap mt-8">
        <Reveal>
          <div className="torn-wrap relative max-w-xl"><span className="tape -top-2.5 right-8 z-10 rotate-6" aria-hidden="true" /><div className="torn bg-parchment px-7 py-9">
            <p className="label">Being typeset</p>
            <p className="mt-2">
              This page is built in {props.phase}. The header, footer, ticker and page transitions are already live, so
              you can click around and judge the feel.
            </p>
            <Link to="/" className="mt-4 inline-flex min-h-11 items-center font-bold text-oxblood">
              Back to the front page <span aria-hidden="true" className="arrow ml-1.5">⟶</span>
            </Link>
          </div></div>
        </Reveal>
      </div>
    </>
  )
}

/* Local preview sign-in: pick a role to see the signed-in states. */
export function SignInPreview() {
  const { user, signInPreview, signOut } = useSession()
  const roles: { role: Role; note: string }[] = [
    { role: 'member', note: 'Comment, like, bookmark, submit an essay.' },
    { role: 'editor', note: 'Member rights, plus writing and drafts.' },
    { role: 'owner', note: 'Everything, including Moderation, Manage and Team.' },
  ]
  return (
    <>
      <PageHead
        info
        symbol="fe"
        title="Sign in"
        purpose="Preview mode: choose a role to see how the site changes when signed in."
      />
      <div className="wrap mt-8 max-w-xl">
        {user ? (
          <div className="card p-6">
            <p>
              Signed in as <strong>{user.name}</strong>.
            </p>
            <button type="button" onClick={signOut} className="btn btn-ghost mt-4">
              Sign out
            </button>
          </div>
        ) : (
          <ul className="grid gap-3">
            {roles.map((r) => (
              <li key={r.role}>
                <button
                  type="button"
                  onClick={() => signInPreview(r.role)}
                  className="card flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left"
                >
                  <span>
                    <span className="block font-display text-lg font-bold capitalize">Preview as {r.role}</span>
                    <span className="text-sm text-charcoal">{r.note}</span>
                  </span>
                  <span aria-hidden="true" className="arrow text-oxblood">
                    ⟶
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="meta mt-5">Real email sign-in is connected in the accounts phase.</p>
      </div>
    </>
  )
}
