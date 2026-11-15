import { PageTransition } from './utils/motion'
import { RouterProvider, useRouter } from './utils/router'
import { SessionProvider } from './services/session'
import { InkFilters } from './components/Symbols'
import Navbar from './components/Navbar'
import Ticker from './components/Ticker'
import Footer from './components/Footer'
import HomeView from './views/HomeView'
import PlaceholderView, { SignInPreview } from './views/PlaceholderView'
import ArticlesView from './views/ArticlesView'
import MotionsView from './views/MotionsView'
import FloorView from './views/FloorView'
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
      return <PlaceholderView info symbol="dagger" title="Page not found" purpose="That page is not in the archive." phase="no phase: the address is wrong" />
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
