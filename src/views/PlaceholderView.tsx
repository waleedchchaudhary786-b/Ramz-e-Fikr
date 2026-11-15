import { Reveal } from '../utils/motion'
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
}: {
  symbol: SymbolName
  title: string
  purpose: string
  info?: boolean
}) {
  return (
    <header className={info ? 'zone-info' : ''}>
      <div className="wrap pt-10 pb-8 md:pt-14">
        <p className="label">{info ? 'Site information' : 'The archive'}</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">
          <Sym name={symbol} className="mr-3" />
          {title}
        </h1>
        <p className="measure mt-3 text-lg text-charcoal">{purpose}</p>
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
          <div className="note max-w-xl p-6">
            <p className="label">Being typeset</p>
            <p className="mt-2">
              This page is built in {props.phase}. The header, footer, ticker and page transitions are already live, so
              you can click around and judge the feel.
            </p>
            <Link to="/" className="mt-4 inline-flex min-h-11 items-center font-bold text-oxblood">
              Back to the front page <span aria-hidden="true" className="ml-1.5">⟶</span>
            </Link>
          </div>
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
                  <span aria-hidden="true" className="text-oxblood">
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
