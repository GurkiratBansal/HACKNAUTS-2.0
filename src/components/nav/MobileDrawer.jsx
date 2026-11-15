// FRESH:FILE  Accessible mobile navigation drawer with focus trap, Escape to close, and focus return.
// FRESH:AREA  Layout

import { useEffect, useRef } from 'react'
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
  'flex min-h-12 items-center gap-3 rounded-[10px] px-3.5 text-sm font-medium transition active:scale-[0.98]'

export default function MobileDrawer({
  open,
  onClose,
  currentUser,
  dashboardPath,
  onLogout,
  triggerRef,
}) {
  const drawerRef = useRef(null)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    // Focus the close button when opened
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus()
    }, 50)

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        triggerRef?.current?.focus()
      } else if (event.key === 'Tab') {
        // Focus trap inside drawer
        if (!drawerRef.current) return
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusableElements.length === 0) return
        const first = focusableElements[0]
        const last = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, triggerRef])

  const handleClose = () => {
    onClose()
    triggerRef?.current?.focus()
  }

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
    <div
      className="fixed inset-0 z-[1250] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      ref={drawerRef}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close menu"
        className="absolute inset-0 bg-[#06130F]/70 backdrop-blur-sm transition-opacity"
      />
      <aside className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] animate-slide-in flex-col border-l border-line bg-surface shadow-2xl dark:border-white/10 dark:bg-[#0B2219]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-white/10">
          <Link to="/" onClick={handleClose}>
            <Brand />
          </Link>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-ink-soft transition hover:bg-elevated hover:text-ink dark:border-white/10 dark:hover:bg-white/5"
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
              onClick={handleClose}
              className={({ isActive }) =>
                `${linkBase} mb-1.5 ${
                  isActive
                    ? 'border border-[#3EE6B8]/40 bg-[#3EE6B8]/10 text-emerald-800 font-semibold dark:text-[#3EE6B8]'
                    : 'text-ink-soft hover:bg-elevated hover:text-ink dark:hover:bg-white/5 dark:text-[#A9BBB2]'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 opacity-50" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-line p-4 dark:border-white/10">
          <div className="flex items-center justify-between rounded-[10px] border border-line bg-elevated px-3.5 py-2 dark:border-white/10 dark:bg-[#06130F]">
            <span className="text-xs font-medium text-ink-soft dark:text-[#A9BBB2]">Appearance</span>
            <ThemeToggle />
          </div>

          {currentUser ? (
            <>
              <div className="flex items-center gap-3 rounded-[10px] border border-line p-3 dark:border-white/10 dark:bg-[#06130F]">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-emerald-600 text-white font-bold">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink dark:text-white">
                    {currentUser.orgName || currentUser.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-[#A9BBB2]">
                    {currentUser.role === 'donor' ? 'Food donor' : 'NGO partner'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLogout()
                  handleClose()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-line bg-surface py-2.5 text-xs font-bold text-danger-600 transition hover:bg-danger-50 dark:border-white/10 dark:bg-white/5 dark:text-danger-300 dark:hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 rounded-[10px] border border-line py-2.5 text-xs font-bold text-ink transition hover:bg-elevated dark:border-white/15 dark:text-white dark:hover:bg-white/5"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Log in
              </Link>
              <Link
                to="/register"
                onClick={handleClose}
                className="fresh-btn-primary flex items-center justify-center py-2.5 text-xs font-bold"
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
