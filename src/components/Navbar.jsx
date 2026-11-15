// FRESH:FILE  Top navigation: wordmark left, centered bordered bar with links, right mint-to-teal gradient CTA.
// FRESH:AREA  Layout

import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Menu, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Brand from './Brand'
import ThemeToggle from './ThemeToggle'
import MobileDrawer from './nav/MobileDrawer'

const navLinkClass = ({ isActive }) =>
  `relative px-3 py-1.5 text-xs font-semibold tracking-tight rounded-[8px] transition duration-150 ${
    isActive
      ? 'text-[#0C1A15] bg-[#D3DCD8]/40 dark:text-[#F2F7F4] dark:bg-white/10 font-bold'
      : 'text-ink-soft hover:text-ink hover:bg-black/5 dark:text-[#A9BBB2] dark:hover:text-[#F2F7F4] dark:hover:bg-white/5'
  }`

export default function Navbar() {
  const { currentUser, logout } = useApp()
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const navigate = useNavigate()
  const dashboardPath = currentUser?.role === 'ngo' ? '/ngo' : '/donor'
  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-[1100] border-b border-line/80 bg-surface/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#06130F]/90">
      <nav
        className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Left: Custom inline-SVG wordmark */}
        <Link
          to="/"
          onClick={close}
          className="shrink-0 rounded-[10px] transition hover:opacity-95 focus-visible:outline-none"
        >
          <Brand showTagline={false} />
        </Link>

        {/* Center: Centered bordered pill-bar (1px line, 10px radius) */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-1 rounded-[10px] border border-line bg-surface/60 px-2 py-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#0B2219]/70">
            <NavLink to="/" end className={navLinkClass}>
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
        </div>

        {/* Right side: Desktop theme toggle, auth chip and bright mint-to-teal gradient CTA */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ThemeToggle />
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="flex max-w-[210px] items-center gap-2 rounded-[10px] border border-line bg-elevated py-1 pl-1 pr-3 dark:border-white/10 dark:bg-[#0B2219]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-emerald-600 text-white font-bold text-xs">
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted dark:text-[#A9BBB2]">
                    {currentUser.role === 'donor' ? 'Donor' : 'NGO'}
                  </span>
                  <span className="block truncate text-xs font-semibold text-ink dark:text-white">
                    {currentUser.orgName || currentUser.name}
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line px-3 text-xs font-semibold text-ink-soft transition hover:bg-elevated hover:text-ink active:scale-95 dark:border-white/10 dark:text-[#A9BBB2] dark:hover:bg-white/5 dark:hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line px-3 text-xs font-semibold text-ink transition hover:bg-elevated active:scale-95 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Log in
              </Link>
              <Link
                to="/register"
                className="fresh-btn-primary inline-flex h-9 items-center px-4 text-xs font-bold shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: Compact header with CTA, Theme toggle and hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {!currentUser ? (
            <Link
              to="/register"
              className="fresh-btn-primary inline-flex h-8 items-center px-3 text-xs font-bold"
            >
              Join
            </Link>
          ) : currentUser.role === 'donor' ? (
            <Link
              to="/donor/add"
              className="fresh-btn-primary inline-flex h-8 items-center px-3 text-xs font-bold"
            >
              Add
            </Link>
          ) : null}
          <ThemeToggle className="hidden sm:inline-flex" />
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-ink transition hover:bg-elevated active:scale-95 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
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
        triggerRef={menuButtonRef}
      />
    </header>
  )
}
