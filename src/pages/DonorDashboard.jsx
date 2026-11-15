// FRESH:FILE  Donor dashboard: my listings, statuses and impact.
// FRESH:AREA  Donations

import { useMemo } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ListChecks,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import FoodCard from '../components/FoodCard'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import DashboardShell from '../components/dashboard/DashboardShell'
import SidePanel from '../components/dashboard/SidePanel'
import StatTile from '../components/dashboard/StatTile'
import { getUrgency, URGENCY_DISCLAIMER } from '../utils/urgency'
import { formatNumber } from '../utils/format'

const CHECKLIST = [
  'Share only food you would serve to your own family.',
  'Add a clear photo and honest handling notes.',
  'Set a pickup deadline you can actually honour.',
]

export default function DonorDashboard() {
  const { currentUser, donations } = useApp()

  const mine = useMemo(
    () =>
      donations
        .filter((d) => d.donorId === currentUser?.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [donations, currentUser],
  )

  const active = mine.filter((d) => d.status !== 'distributed')
  const completed = mine.filter((d) => d.status === 'distributed')
  const expired = mine.filter(
    (d) => d.status === 'available' && getUrgency(d.deadline).key === 'expired',
  )
  const mealsListed = mine.reduce((sum, d) => sum + Number(d.quantity || 0), 0)
  const mealsDistributed = completed.reduce((sum, d) => sum + Number(d.quantity || 0), 0)

  return (
    <DashboardShell
      role="donor"
      eyebrow="Donor dashboard"
      title={currentUser?.orgName || currentUser?.name}
      description="Live status for every listing you have shared with the network."
      actions={
        <Button to="/donor/add" icon={PlusCircle}>
          List surplus food
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Clock3}
          label="Active listings"
          value={active.length}
          hint={
            expired.length > 0
              ? `${expired.length} past the deadline`
              : 'Waiting for a nearby NGO'
          }
          tone="brand"
        />
        <StatTile
          icon={UtensilsCrossed}
          label="Servings listed"
          value={mealsListed}
          hint="Across every listing you shared"
          tone="saffron"
        />
        <StatTile
          icon={CheckCircle2}
          label="Servings distributed"
          value={mealsDistributed}
          hint="Meals marked as delivered"
          tone="info"
        />
        <StatTile
          icon={Sparkles}
          label="Expired"
          value={expired.length}
          hint="Visible to you, hidden from NGOs"
          tone="neutral"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="active-donations">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="active-donations"
                  className="font-display text-xl font-bold tracking-tight text-fresh-ink dark:text-fresh-light-bg"
                >
                  Active donations
                </h2>
                <p className="mt-0.5 text-xs text-fresh-ink-muted dark:text-fresh-ink-soft">
                  Listings still waiting for a pickup or distribution.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-fresh-border bg-fresh-light-card px-3 py-1 text-xs font-semibold text-fresh-ink-muted dark:bg-fresh-dark-card dark:text-fresh-ink-soft">
                {active.length} open
              </span>
            </div>

            {active.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={UtensilsCrossed}
                  title="No active donations yet"
                  description="List surplus food and FRESH will alert the three nearest verified NGOs automatically."
                  action={
                    <Button to="/donor/add" iconRight={ArrowRight}>
                      Create your first listing
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {active.map((donation) => (
                  <FoodCard
                    key={donation.id}
                    donation={donation}
                    donorView
                  />
                ))}
              </div>
            )}
          </section>

          {completed.length > 0 && (
            <section aria-labelledby="completed-donations">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="completed-donations"
                  className="font-display text-xl font-bold tracking-tight text-fresh-ink dark:text-fresh-light-bg"
                >
                  Completed
                </h2>
                <span className="inline-flex items-center rounded-full border border-fresh-border bg-fresh-light-card px-3 py-1 text-xs font-semibold text-fresh-ink-muted dark:bg-fresh-dark-card dark:text-fresh-ink-soft">
                  {completed.length} delivered
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {completed.map((donation) => (
                  <FoodCard
                    key={donation.id}
                    donation={donation}
                    donorView
                    showSafetyHint={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="relative overflow-hidden rounded-[12px] border border-fresh-border bg-gradient-to-br from-[#0B2219] via-[#06130F] to-[#04100C] p-5 shadow-fresh-sm">
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-fresh-mint/10 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fresh-mint">
                Your impact
              </p>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-white tabular-nums">
                {formatNumber(mealsDistributed)}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#A9BBB2]">
                servings distributed from your kitchen
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <div>
                  <dt className="text-[11px] text-[#A9BBB2]">Completed</dt>
                  <dd className="mt-0.5 text-lg font-bold text-white">
                    {completed.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-[#A9BBB2]">Active</dt>
                  <dd className="mt-0.5 text-lg font-bold text-white">
                    {active.length}
                  </dd>
                </div>
              </dl>

              <Button
                to="/impact"
                variant="primary"
                size="sm"
                iconRight={ArrowRight}
                className="mt-4 w-full"
              >
                See network impact
              </Button>
            </div>
          </section>

          <SidePanel icon={ListChecks} title="Before you list" tone="brand">
            <ul className="space-y-2.5">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-300"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </SidePanel>

          <SidePanel icon={ShieldCheck} title="Good to know" tone="neutral">
            <p>{URGENCY_DISCLAIMER}</p>
            <p className="mt-2">
              Expired listings stay visible here to the donor but are hidden from
              NGO dashboards.
            </p>
          </SidePanel>
        </aside>
      </div>
    </DashboardShell>
  )
}
