// FRESH:FILE  Shared shell for donor/NGO dashboards: tabs, sidebar and the emergency simulator slot.
// FRESH:AREA  Donations

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Building2,
  ChevronLeft,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import EmergencySimulator from '../EmergencySimulator'

const STORAGE_KEY = 'fresh_dash_sidebar_v1'

const NAV = {
  donor: [
    { to: '/donor', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/donor/add', label: 'List surplus', icon: PlusCircle },
    { to: '/map', label: 'Nearby map', icon: MapPin },
    { to: '/impact', label: 'Impact', icon: Sparkles },
    { to: '/terms', label: 'Trust & safety', icon: ShieldCheck },
  ],
  ngo: [
    { to: '/ngo', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/map', label: 'Nearby map', icon: MapPin },
    { to: '/impact', label: 'Impact', icon: Sparkles },
    { to: '/terms', label: 'Trust & safety', icon: ShieldCheck },
  ],
}

const ROLE = {
  donor: {
    label: 'Donor workspace',
    icon: UtensilsCrossed,
    tip: 'Urgency comes from the pickup deadline, not from an algorithm.',
  },
  ngo: {
    label: 'NGO workspace',
    icon: Building2,
    tip: 'The receiving team always inspects food before distribution.',
  },
}

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function SidebarLink({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex min-h-11 items-center gap-2.5 rounded-[8px] text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fresh-mint ${
          collapsed ? 'justify-center px-0' : 'px-3'
        } ${
          isActive
            ? 'border border-fresh-mint/30 bg-fresh-mint/15 text-fresh-mint shadow-fresh-sm'
            : 'text-fresh-ink-muted hover:bg-black/5 hover:text-fresh-ink dark:text-fresh-ink-soft dark:hover:bg-white/5 dark:hover:text-fresh-light-bg'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

export default function DashboardShell({
  role = 'donor',
  eyebrow,
  title,
  description,
  badge,
  actions,
  children,
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const items = NAV[role] || NAV.donor
  const roleMeta = ROLE[role] || ROLE.donor
  const RoleIcon = roleMeta.icon

  const toggle = () => {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* Storage can be unavailable in private modes. */
      }
      return next
    })
  }

  return (
    <main className="relative min-h-[60vh] bg-fresh-light-bg dark:bg-fresh-dark-bg">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-fresh-mint/5 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="lg:flex lg:items-start lg:gap-6 xl:gap-8">
          <aside
            id="dashboard-sidebar"
            className={`hidden shrink-0 transition-[width] duration-300 lg:block ${
              collapsed ? 'lg:w-[76px]' : 'lg:w-60'
            }`}
          >
            <div className="sticky top-24 space-y-3">
              <div className="rounded-[12px] border border-fresh-border bg-fresh-light-card p-2 shadow-fresh-sm dark:bg-fresh-dark-card">
                <div
                  className={`flex items-center gap-2.5 rounded-[8px] bg-black/5 px-2 py-2 dark:bg-white/5 ${
                    collapsed ? 'justify-center px-0' : ''
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-fresh-mint/15 text-fresh-mint">
                    <RoleIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-fresh-ink-muted">
                        Workspace
                      </p>
                      <p className="truncate text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">
                        {roleMeta.label}
                      </p>
                    </div>
                  )}
                </div>

                <nav aria-label="Dashboard" className="mt-2 space-y-1">
                  {items.map((item) => (
                    <SidebarLink key={item.to} item={item} collapsed={collapsed} />
                  ))}
                </nav>

                <EmergencySimulator embedded collapsed={collapsed} />

                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={!collapsed}
                  aria-controls="dashboard-sidebar"
                  aria-label={
                    collapsed
                      ? 'Expand dashboard sidebar'
                      : 'Collapse dashboard sidebar'
                  }
                  className={`mt-2 flex min-h-10 w-full items-center gap-2 rounded-[8px] border-t border-fresh-border px-3 pt-2 text-xs font-semibold text-fresh-ink-muted transition hover:bg-black/5 hover:text-fresh-ink dark:text-fresh-ink-soft dark:hover:bg-white/5 dark:hover:text-fresh-light-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-fresh-mint ${
                    collapsed ? 'justify-center px-0' : ''
                  }`}
                >
                  <ChevronLeft
                    className={`h-4 w-4 transition-transform duration-300 ${
                      collapsed ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                  {!collapsed && 'Collapse sidebar'}
                </button>
              </div>

              {!collapsed && (
                <p className="rounded-[10px] border border-fresh-border bg-fresh-light-card/60 px-3 py-2.5 text-[11px] leading-relaxed text-fresh-ink-muted dark:bg-fresh-dark-card/60 dark:text-fresh-ink-soft">
                  {roleMeta.tip}
                </p>
              )}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <nav
              aria-label="Dashboard sections"
              className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden"
            >
              <div className="flex w-max gap-1.5 rounded-[10px] border border-fresh-border bg-fresh-light-card p-1.5 shadow-fresh-sm dark:bg-fresh-dark-card">
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `inline-flex min-h-11 items-center gap-2 rounded-[8px] px-3 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-fresh-mint ${
                          isActive
                            ? 'border border-fresh-mint/30 bg-fresh-mint/15 text-fresh-mint shadow-fresh-sm'
                            : 'text-fresh-ink-muted hover:bg-black/5 hover:text-fresh-ink dark:text-fresh-ink-soft dark:hover:bg-white/5 dark:hover:text-fresh-light-bg'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            </nav>

            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fresh-mint">
                    {eyebrow}
                  </p>
                  {badge}
                </div>
                <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-fresh-ink dark:text-fresh-light-bg sm:text-4xl">
                  {title}
                </h1>
                {description && (
                  <div className="mt-1.5 text-sm leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
                    {description}
                  </div>
                )}
              </div>
              {actions && (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
              )}
            </header>

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
