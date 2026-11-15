import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Menu, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import MobileDrawer from './nav/MobileDrawer'

const navLink =
  'group relative rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink ' +
  'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 ' +
  'after:rounded-full after:bg-saffron-500 after:transition-transform after:duration-200 ' +
  'hover:after:scale-x-100'

const activeNavLink =
  'text-brand-700 after:scale-x-100 dark:text-brand-200'

export default function Navbar() {
  const { currentUser, logout } = useApp()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const dashboardPath = currentUser?.role === 'ngo' ? '/ngo' : '/donor'
  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-[1100] border-b border-line/80 bg-surface/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          onClick={close}
          className="shrink-0 rounded-xl transition hover:opacity-90 focus-visible:outline-brand-500"
        >
          <Brand />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          <NavLink to="/" end className={({ isActive }) => `${navLink} ${isActive ? activeNavLink : ''}`}>
            Home
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `${navLink} ${isActive ? activeNavLink : ''}`}>
            Map
          </NavLink>
          <NavLink to="/impact" className={({ isActive }) => `${navLink} ${isActive ? activeNavLink : ''}`}>
            Impact
          </NavLink>
          <NavLink to="/terms" className={({ isActive }) => `${navLink} ${isActive ? activeNavLink : ''}`}>
            Trust &amp; safety
          </NavLink>
          {currentUser && (
            <NavLink
              to={dashboardPath}
              className={({ isActive }) => `${navLink} ${isActive ? activeNavLink : ''}`}
            >
              Dashboard
            </NavLink>
          )}
          {currentUser?.role === 'donor' && (
            <NavLink
              to="/donor/add"
              className={({ isActive }) => `${navLink} ${isActive ? activeNavLink : ''}`}
            >
              Add food
            </NavLink>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <ThemeToggle />
          {currentUser ? (
            <>
              <span className="flex max-w-[210px] items-center gap-2 rounded-full border border-line bg-elevated py-1 pl-1 pr-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    {currentUser.role === 'donor' ? 'Donor' : 'NGO'}
                  </span>
                  <span className="block truncate text-xs font-semibold text-ink">
                    {currentUser.orgName || currentUser.name}
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft transition hover:bg-elevated hover:text-ink active:scale-95"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-ink-soft transition hover:bg-elevated hover:text-ink active:scale-95"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex h-10 items-center rounded-full bg-saffron-500 px-4 text-sm font-bold text-brand-950 shadow-glow transition hover:bg-saffron-400 active:scale-95"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle className="hidden sm:inline-flex" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-elevated active:scale-95"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <MobileDrawer
        open={open}
        onClose={close}
        currentUser={currentUser}
        dashboardPath={dashboardPath}
        onLogout={handleLogout}
      />
    </header>
  )
}
