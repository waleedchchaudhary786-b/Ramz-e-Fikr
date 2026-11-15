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
    case '/dashboard':
      return <DashboardView />
    case '/signin':
      return <SignInPreview />
    default:
      return <PlaceholderView info symbol="dagger" title="Page not found" purpose="That page is not in the archive." phase="no phase: the address is wrong" />
  }
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
