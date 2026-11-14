import { useEffect } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toast from './components/Toast'
import Button from './components/ui/Button'
import { useApp } from './context/AppContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import DonorDashboard from './pages/DonorDashboard'
import AddDonation from './pages/AddDonation'
import NGODashboard from './pages/NGODashboard'
import MapPage from './pages/MapPage'
import DonationDetail from './pages/DonationDetail'
import ImpactDashboard from './pages/ImpactDashboard'
import Terms from './pages/Terms'

/** Route guard for the demo's two roles. */
function RequireRole({ role, children }) {
  const { currentUser } = useApp()
  if (!currentUser) {
    return <Navigate to={`/login?role=${role}`} replace />
  }
  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'ngo' ? '/ngo' : '/donor'} replace />
  }
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <main className="relative overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/70 blur-3xl dark:bg-brand-900/40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-saffron-100/60 blur-3xl dark:bg-saffron-900/20"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
          404 · Off the menu
        </p>
        <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          That page is not on the menu.
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
          The link may be old, or the listing may have been removed. Head back to
          the live map to find available food.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Button to="/" variant="primary">
            Back to home
          </Button>
          <Button to="/map" variant="outline">
            Open the map
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const hideFooter = pathname === '/map'

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-xl focus:bg-brand-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lift focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-saffron-400"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <Navbar />
      <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/donor"
            element={
              <RequireRole role="donor">
                <DonorDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/donor/add"
            element={
              <RequireRole role="donor">
                <AddDonation />
              </RequireRole>
            }
          />
          <Route
            path="/ngo"
            element={
              <RequireRole role="ngo">
                <NGODashboard />
              </RequireRole>
            }
          />
          <Route path="/map" element={<MapPage />} />
          <Route path="/donation/:id" element={<DonationDetail />} />
          <Route path="/impact" element={<ImpactDashboard />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
      <Toast />
    </div>
  )
}
