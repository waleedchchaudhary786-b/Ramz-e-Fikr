import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { Brand } from './Navbar'
import { Seal } from './Doodles'
import { Fold } from './Bits'

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
        { to: '/forum', label: 'Forum' },
        { to: '/tab', label: 'Tournaments' },
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
            <p className="label !font-bold !text-ink">About this site</p>
            <p className="mt-2 max-w-xs text-sm text-charcoal">
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
              <Fold key={c.title} summary={<span className="label !font-bold !text-ink">{c.title}</span>}>
                <ul>
                  {c.items.map((it) => (
                    <li key={it.label}>
                      <ItemLink item={it} />
                    </li>
                  ))}
                </ul>
              </Fold>
            ))}
          </div>
        </div>

        {/* poster sign-off: wordmark, tagline and seal, as on the Instagram posts */}
        <div className="mt-10 flex flex-col items-center border-t border-border-warm pt-8 text-center">
          <Link to="/" aria-label="Ramz-e-Fikr home" className="relative inline-block">
            <Brand stacked />
            <Seal className="absolute -top-2 -right-24 hidden text-oxblood/80 sm:block" size={76} />
          </Link>
          <p className="label mt-3">Where thought becomes argument.</p>
          <p className="hand mt-3 -rotate-1 text-2xl text-oxblood">one community, endless perspectives</p>
          <p className="meta mt-5">Vol. I · 2026 · Lahore · Faisalabad</p>
        </div>
      </div>
    </footer>
  )
}
