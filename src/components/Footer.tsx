import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { Brand } from './Navbar'
import { Sym } from './Symbols'

type Item = { to: string; label: string } | { label: string; onClick: () => void }
type Col = { title: string; items: Item[] }

function ItemLink({ item }: { item: Item }) {
  const cls = 'flex min-h-11 items-center text-[0.9375rem] hover:text-oxblood md:min-h-0 md:py-1'
  if ('to' in item)
    return (
      <Link to={item.to} className={cls}>
        {item.label}
      </Link>
    )
  return (
    <button type="button" onClick={item.onClick} className={`${cls} cursor-pointer`}>
      {item.label}
    </button>
  )
}

/* Site-info zone: parchment band, double rule, typewriter labels. */
export default function Footer() {
  const { user, signOut } = useSession()

  const cols: Col[] = [
    {
      title: 'Explore',
      items: [
        { to: '/articles', label: 'Articles' },
        { to: '/resources', label: 'Resources' },
        { to: '/motions', label: 'Motions' },
        { to: '/floor', label: 'The Floor' },
        { to: '/glossary', label: 'Glossary' },
      ],
    },
    {
      title: 'The Publication',
      items: [
        { to: '/about', label: 'About' },
        { to: '/desk', label: 'The Desk' },
        { to: '/about#guide', label: 'User guide' },
        { to: '/desk#submit', label: 'Submit an essay' },
      ],
    },
    {
      title: 'Account',
      items: user
        ? [
            { to: '/dashboard', label: 'My Dashboard' },
            { label: 'Sign out', onClick: signOut },
          ]
        : [
            { to: '/signin', label: 'Sign in' },
            { to: '/signin', label: 'Create account' },
          ],
    },
  ]

  return (
    <footer className="zone-info mt-16">
      <div className="wrap pt-10 pb-8">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="label mt-3">Where thought becomes argument.</p>
            <p className="mt-3 max-w-xs text-sm text-charcoal">
              An open archive of debate resources, kept by students and free to use.
            </p>
          </div>

          {/* desktop: three plain columns */}
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title} className="hidden md:block">
              <h2 className="label mb-2 !font-bold !text-ink">{c.title}</h2>
              <ul>
                {c.items.map((it) => (
                  <li key={it.label}>
                    <ItemLink item={it} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* mobile: accordions */}
          <div className="md:hidden">
            {cols.map((c) => (
              <details key={c.title} className="group border-t border-border-warm last:border-b">
                <summary className="label flex min-h-12 cursor-pointer list-none items-center justify-between !font-bold !text-ink [&::-webkit-details-marker]:hidden">
                  {c.title}
                  <span
                    aria-hidden="true"
                    className="font-sans text-lg text-oxblood transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <ul className="pb-2">
                  {c.items.map((it) => (
                    <li key={it.label}>
                      <ItemLink item={it} />
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border-warm pt-4">
          <p className="meta">Vol. I · 2026 · Lahore · Faisalabad</p>
          <p className="meta">
            <Sym name="fe" className="mr-1 text-base" /> Ramz-e-Fikr
          </p>
        </div>
      </div>
    </footer>
  )
}
