// FRESH:FILE  Mobile navigation drawer.
// FRESH:AREA  Layout

import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  PlusCircle,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import Brand from '../Brand'
import ThemeToggle from '../ThemeToggle'

const linkBase =
  'flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition active:scale-[0.99]'

export default function MobileDrawer({
  open,
  onClose,
  currentUser,
  dashboardPath,
  onLogout,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const items = [
    { to: '/', label: 'Home', icon: Leaf, end: true },
    { to: '/map', label: 'Nearby map', icon: MapPin },
    { to: '/impact', label: 'Impact', icon: BarChart3 },
    { to: '/terms', label: 'Trust & safety', icon: ShieldCheck },
  ]
  if (currentUser) {
    items.push({ to: dashboardPath, label: 'Dashboard', icon: LayoutDashboard })
  }
  if (currentUser?.role === 'donor') {
    items.push({ to: '/donor/add', label: 'Add food', icon: PlusCircle })
  }

  return (
    <div className="fixed inset-0 z-[1250] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute inset-0 bg-overlay/50 backdrop-blur-sm"
      />
      <aside className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] animate-slide-in flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-5">
          <Link to="/" onClick={onClose} aria-label="FRESH home">
            <Brand />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition hover:bg-elevated hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} mb-1 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'text-ink-soft hover:bg-elevated hover:text-ink'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-line p-4">
          <div className="flex items-center justify-between rounded-xl bg-elevated px-3.5 py-2.5">
            <span className="text-sm font-medium text-ink-soft">Appearance</span>
            <ThemeToggle />
          </div>

          {currentUser ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {currentUser.orgName || currentUser.name}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-ink-muted">
                    {currentUser.role === 'donor' ? 'Donor' : 'NGO'} account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-ink-soft transition hover:bg-elevated active:scale-[0.99]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
              </button>
            </>
          ) : (
            <div className="grid gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-600 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 active:scale-[0.99] dark:text-brand-200 dark:hover:bg-brand-900/40"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" /> Log in
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex min-h-12 items-center justify-center rounded-xl bg-saffron-500 text-sm font-bold text-brand-950 shadow-glow transition hover:bg-saffron-400 active:scale-[0.99]"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
