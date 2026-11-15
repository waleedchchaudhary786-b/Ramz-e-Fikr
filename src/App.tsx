import { PageTransition } from './utils/motion'
import { RouterProvider, useRouter } from './utils/router'
import { SessionProvider } from './services/session'
import { InkFilters } from './components/Symbols'
import Navbar from './components/Navbar'
import Ticker from './components/Ticker'
import Footer from './components/Footer'
import HomeView from './views/HomeView'
import PlaceholderView, { SignInPreview } from './views/PlaceholderView'

function Routes() {
  const { path } = useRouter()
  const top = '/' + (path.split('/')[1] ?? '')
  switch (top) {
    case '/':
      return <HomeView />
    case '/articles':
      return <PlaceholderView symbol="hand" title="Articles" purpose="Essays and opinion from debaters, each with one idea worth arguing about." phase="Phase 3" />
    case '/resources':
      return <PlaceholderView symbol="section" title="Resources" purpose="Guides, casefiles and worksheets to prepare with." phase="Phase 3" />
    case '/motions':
      return <PlaceholderView symbol="pilcrow" title="Motions" purpose="A searchable bank of motions, with a prep timer and a random draw." phase="Phase 3" />
    case '/floor':
      return <PlaceholderView symbol="leaf" title="The Floor" purpose="Where readers argue back: discuss our articles, or take the week's open prompt." phase="Phase 3" />
    case '/glossary':
      return <PlaceholderView symbol="dagger" title="Glossary" purpose="Debate terms in plain language, in English and Urdu." phase="Phase 3" />
    case '/about':
      return <PlaceholderView info symbol="fe" title="About" purpose="What Ramz-e-Fikr is, how the site works, and a guide to using it." phase="Phase 3" />
    case '/desk':
      return <PlaceholderView info symbol="dagger" title="The Desk" purpose="Who runs the publication, how to submit, and how approval works." phase="Phase 3" />
    case '/dashboard':
      return <PlaceholderView info symbol="fe" title="My Dashboard" purpose="Your activity, likes, bookmarks and drafts in one place." phase="Phase 4" />
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
      <main id="main" className="flex-1">
        <PageTransition pageKey={path}>
          <Routes />
        </PageTransition>
      </main>
      <Footer />
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
