import { useEffect, useState } from 'react'
import { PageTransition } from './utils/motion'
import { Pen } from './components/Doodles'
import { RouterProvider, useRouter } from './utils/router'
import { SessionProvider } from './services/session'
import { InkFilters } from './components/Symbols'
import Navbar from './components/Navbar'
import Ticker from './components/Ticker'
import Footer from './components/Footer'
import HomeView from './views/HomeView'
import NotFoundView, { SignInPreview } from './views/PlaceholderView'
import ArticlesView from './views/ArticlesView'
import MotionsView from './views/MotionsView'
import FloorView from './views/FloorView'
import ForumView from './views/ForumView'
import { GlossaryView, ResourcesView } from './views/LibraryViews'
import { AboutView, DashboardView, DeskView } from './views/InfoViews'
import LoginNudge from './components/LoginNudge'
import StudioView from './views/StudioView'
import SearchPalette from './components/Search'
import { actions, useStore } from './services/store'

function Routes() {
  const { path } = useRouter()
  const top = '/' + (path.split('/')[1] ?? '')
  switch (top) {
    case '/':
      return <HomeView />
    case '/articles':
      return <ArticlesView />
    case '/resources':
      return <ResourcesView />
    case '/motions':
      return <MotionsView />
    case '/floor':
      return <FloorView />
    case '/forum':
      return <ForumView />
    case '/glossary':
      return <GlossaryView />
    case '/about':
      return <AboutView />
    case '/desk':
      return <DeskView />
    case '/write':
      return <StudioView />
    case '/dashboard':
      return <DashboardView />
    case '/signin':
      return <SignInPreview />
    default:
      return <NotFoundView />
  }
}

/** Shows the reason when the database refuses a change. */
function StoreNotice() {
  const { error } = useStore()
  if (!error) return null
  return (
    <div role="alert" className="fixed inset-x-3 top-24 z-[80] mx-auto flex max-w-md items-start gap-3 border border-ink bg-parchment p-4 shadow-[4px_5px_0_rgba(23,23,23,0.12)]">
      <p className="flex-1 text-[0.9375rem]">{error}</p>
      <button type="button" onClick={actions.clearError} className="min-h-11 px-2 font-mono text-[0.8125rem] text-oxblood underline">
        Close
      </button>
    </div>
  )
}

/** A pen that appears once you have scrolled, and carries you back to the top. */
function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className="group fixed right-4 bottom-4 z-40 grid h-12 w-12 place-items-center border border-oxblood bg-ivory text-oxblood shadow-[3px_3px_0_var(--color-gold)] transition-[transform,opacity] duration-300 hover:-translate-y-1 md:right-6 md:bottom-6"
      style={{ opacity: show ? 1 : 0, transform: show ? undefined : 'translateY(20px)', pointerEvents: show ? 'auto' : 'none' }}
    >
      <Pen size={26} style={{ transform: 'rotate(180deg)' }} />
    </button>
  )
}

function Shell() {
  const { path } = useRouter()
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ivory focus:p-3">
        Skip to content
      </a>
      <InkFilters />
      <Navbar />
      <Ticker />
      <main id="main" className="flex-1 overflow-x-clip">
        <PageTransition pageKey={path}>
          <Routes />
        </PageTransition>
      </main>
      <Footer />
      <LoginNudge />
      <SearchPalette />
      <StoreNotice />
      <BackToTop />
    </div>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <SessionProvider>
        <Shell />
      </SessionProvider>
    </RouterProvider>
  )
}
