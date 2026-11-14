import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-800'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function Navbar() {
  const { currentUser, logout } = useApp()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const close = () => setOpen(false)
  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  const dashboardPath =
    currentUser?.role === 'ngo' ? '/ngo' : '/donor'

  return (
    <header className="sticky top-0 z-[1100] border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-slate-900">FRESH</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:block">
              Food · Reduce · Share
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/map" className={navLinkClass}>
            Map
          </NavLink>
          <NavLink to="/impact" className={navLinkClass}>
            Impact
          </NavLink>
          <NavLink to="/terms" className={navLinkClass}>
            Trust &amp; safety
          </NavLink>
          {currentUser && (
            <NavLink to={dashboardPath} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {currentUser?.role === 'donor' && (
            <NavLink to="/donor/add" className={navLinkClass}>
              Add food
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {currentUser ? (
            <>
              <span className="max-w-[180px] truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {currentUser.role === 'donor' ? 'Donor' : 'NGO'} ·{' '}
                {currentUser.orgName || currentUser.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={navLinkClass} end onClick={close}>
              <span className="inline-flex items-center gap-2"><Leaf className="h-4 w-4" /> Home</span>
            </NavLink>
            <NavLink to="/map" className={navLinkClass} onClick={close}>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Map</span>
            </NavLink>
            <NavLink to="/impact" className={navLinkClass} onClick={close}>
              <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Impact</span>
            </NavLink>
            <NavLink to="/terms" className={navLinkClass} onClick={close}>
              Trust &amp; safety
            </NavLink>
            {currentUser && (
              <NavLink to={dashboardPath} className={navLinkClass} onClick={close}>
                <span className="inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</span>
              </NavLink>
            )}
            {currentUser?.role === 'donor' && (
              <NavLink to="/donor/add" className={navLinkClass} onClick={close}>
                <span className="inline-flex items-center gap-2"><PlusCircle className="h-4 w-4" /> Add food</span>
              </NavLink>
            )}
            <div className="mt-3 border-t border-slate-200 pt-3">
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={close}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={close}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {location.pathname}
      </span>
    </header>
  )
}
