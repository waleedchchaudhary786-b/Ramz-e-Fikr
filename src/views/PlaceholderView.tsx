import { Doodle, Stick, Sweep, TypeReveal, WordReveal } from '../utils/motion'
import { Sparks, Star } from '../components/Doodles'
import { Link } from '../utils/router'
import { useState } from 'react'
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
              <p className="hand torn bg-parchment px-5 py-6 text-2xl text-oxblood" style={info ? { background: 'var(--color-ivory)' } : undefined}>
                {note}
              </p>
            </Stick>
          )}
        </div>
      </div>
    </header>
  )
}

export default function NotFoundView() {
  return (
    <>
      <PageHead symbol="dagger" title="Page not found" purpose="That page is not in the archive. It may have moved, or the address may have a typo." note="Lost? Even good debaters lose the thread." />
      <div className="wrap flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">
          Back to the front page <span aria-hidden="true" className="arrow">⟶</span>
        </Link>
        <Link to="/motions" className="btn btn-ghost">
          Browse the motions
        </Link>
      </div>
    </>
  )
}

/* Sign in. Connected: a code by email (no passwords to remember or leak).
   Local preview: pick a role to see the signed-in states. */
export function SignInPreview() {
  const { connected } = useSession()
  return connected ? <SignInReal /> : <SignInLocal />
}

function SignInReal() {
  const { user, ready, sendCode, verifyCode, signOut } = useSession()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onEmail(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const r = await sendCode(email.trim(), name.trim())
    setBusy(false)
    if (r.ok) setStep('code')
    else setMsg(r.message)
  }
  async function onCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const r = await verifyCode(email.trim(), code.trim())
    setBusy(false)
    if (!r.ok) setMsg(r.message)
  }

  return (
    <>
      <PageHead info symbol="fe" title="Sign in" purpose="One step for new and returning members: we email you a code." note="No password to remember." />
      <div className="wrap max-w-md pt-8">
        {!ready ? (
          <p className="meta">Checking…</p>
        ) : user ? (
          <div className="card p-6">
            <p>
              Signed in as <strong>{user.name}</strong> <span className="meta capitalize">· {user.role}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/dashboard" className="btn btn-primary">
                My Dashboard
              </Link>
              <button type="button" onClick={signOut} className="btn btn-ghost">
                Sign out
              </button>
            </div>
          </div>
        ) : step === 'email' ? (
          <form onSubmit={onEmail} className="space-y-6">
            <label className="block">
              <span className="label">Email</span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="paper-input mt-1" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="label">Display name (new members only)</span>
              <input value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={40} autoComplete="nickname" className="paper-input mt-1" placeholder="How your name appears on replies" />
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-50">
              {busy ? 'Sending…' : 'Email me a code'} <span aria-hidden="true" className="arrow">⟶</span>
            </button>
          </form>
        ) : (
          <form onSubmit={onCode} className="space-y-6">
            <p>
              We sent a code to <strong>{email}</strong>. Type it here, or click the link in the email.
            </p>
            <label className="block">
              <span className="label">Code from the email</span>
              <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} className="paper-input mt-1 !text-2xl tracking-[0.3em]" placeholder="000000" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-50">
                {busy ? 'Checking…' : 'Sign in'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="btn btn-ghost">
                Use a different email
              </button>
            </div>
          </form>
        )}
        {msg && (
          <p className="mt-4 text-sm text-oxblood" role="alert">
            {msg}
          </p>
        )}
      </div>
    </>
  )
}

function SignInLocal() {
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
        <p className="meta mt-5">Preview mode: no database is connected, so nothing here is shared with other people. See SETUP.md to connect one.</p>
      </div>
    </>
  )
}
