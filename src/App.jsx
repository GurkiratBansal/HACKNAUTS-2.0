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
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
        That page is not on the menu.
      </h1>
      <p className="mt-2 text-slate-600">
        The link may be old, or the listing may have been removed. Head back to
        the live map to find available food.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a
          href="/"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Back to home
        </a>
        <a
          href="/map"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Open the map
        </a>
      </div>
    </main>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const hideFooter = pathname === '/map'

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7]">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
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
