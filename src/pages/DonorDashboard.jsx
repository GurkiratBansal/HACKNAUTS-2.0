import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  PlusCircle,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import FoodCard from '../components/FoodCard'
import EmptyState from '../components/EmptyState'
import { getUrgency, URGENCY_DISCLAIMER } from '../utils/urgency'

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
    <main className="bg-[#fbfaf7]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Donor dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {currentUser?.orgName || currentUser?.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Live status for every listing you have shared with the network.
            </p>
          </div>
          <Link
            to="/donor/add"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <PlusCircle className="h-4 w-4" /> List surplus food
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Summary icon={Clock3} label="Active listings" value={active.length} tone="emerald" />
          <Summary icon={UtensilsCrossed} label="Servings listed" value={mealsListed} tone="orange" />
          <Summary icon={CheckCircle2} label="Servings distributed" value={mealsDistributed} tone="sky" />
          <Summary icon={Sparkles} label="Expired" value={expired.length} tone="slate" />
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Active donations</h2>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
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
                  <Link to="/donor/add" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                    Create your first listing <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((donation) => (
                <FoodCard key={donation.id} donation={donation} donorView />
              ))}
            </div>
          )}
        </section>

        {completed.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-slate-900">Completed</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((donation) => (
                <FoodCard key={donation.id} donation={donation} donorView showSafetyHint={false} />
              ))}
            </div>
          </section>
        )}

        <p className="mt-8 rounded-xl bg-white p-3 text-xs text-slate-500 ring-1 ring-slate-200">
          {URGENCY_DISCLAIMER} Expired listings stay visible here to the donor but
          are hidden from NGO dashboards.
        </p>
      </div>
    </main>
  )
}

function Summary({ icon: Icon, label, value, tone }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    sky: 'bg-sky-50 text-sky-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-extrabold tabular-nums text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}
