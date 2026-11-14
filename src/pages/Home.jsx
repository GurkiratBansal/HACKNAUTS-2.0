import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Clock,
  HandHeart,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatNumber } from '../utils/format'

const STEPS = [
  {
    icon: UtensilsCrossed,
    title: 'Donate',
    text: 'A kitchen, banquet or individual lists surplus food with a pickup deadline and handling details.',
  },
  {
    icon: Search,
    title: 'Discover',
    text: 'Verified NGOs nearby see the listing on a live map, sorted by urgency and distance.',
  },
  {
    icon: HandHeart,
    title: 'Accept',
    text: 'An NGO accepts the pickup, receives the donor contact, and inspects the food on arrival.',
  },
  {
    icon: Truck,
    title: 'Distribute',
    text: 'The NGO marks the pickup complete and the meals reach people instead of a landfill.',
  },
]

const SDGS = [
  { number: 2, title: 'Zero Hunger', text: 'More meals reach people who need them.', color: 'bg-amber-100 text-amber-900 ring-amber-200' },
  { number: 12, title: 'Responsible Consumption', text: 'Less edible food is thrown away.', color: 'bg-emerald-100 text-emerald-900 ring-emerald-200' },
  { number: 3, title: 'Good Health', text: 'Clear handling and inspection guidance.', color: 'bg-sky-100 text-sky-900 ring-sky-200' },
  { number: 11, title: 'Sustainable Cities', text: 'Local recovery instead of long transport.', color: 'bg-orange-100 text-orange-900 ring-orange-200' },
  { number: 17, title: 'Partnerships', text: 'Donors, volunteers and NGOs working together.', color: 'bg-violet-100 text-violet-900 ring-violet-200' },
]

export default function Home() {
  const { impact, currentUser } = useApp()
  const donorTarget = currentUser?.role === 'donor' ? '/donor/add' : '/login?role=donor'
  const ngoTarget = currentUser?.role === 'ngo' ? '/ngo' : '/login?role=ngo'

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-[#fbfaf7] to-[#fbfaf7]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Surplus food, matched before it spoils
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              From surplus to support,{' '}
              <span className="text-emerald-700">before it goes to waste.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              FRESH connects community kitchens, wedding halls, restaurants and
              individuals with nearby verified NGOs — so good food reaches
              people, not a landfill.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={donorTarget}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                I want to donate food <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={ngoTarget}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Building2 className="h-4 w-4" /> I&apos;m an NGO
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Verified NGO network · Donor declaration required · Sample data for demo
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white p-2 shadow-xl shadow-emerald-900/10">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=75"
                alt="Volunteers packing surplus meals for distribution"
                className="h-64 w-full rounded-2xl object-cover sm:h-80"
              />
            </div>
            <div className="absolute -bottom-5 left-3 w-52 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg sm:left-6">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> Pickup window
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">Veg Biryani · 80 servings</p>
              <p className="mt-0.5 text-xs text-amber-700">Pickup soon · 1 hr 42 min left</p>
            </div>
            <div className="absolute -right-2 top-6 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg sm:-right-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Nearest NGO
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">Roti Bank Delhi</p>
              <p className="mt-0.5 text-xs text-emerald-700">Verified · 2.1 km</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: 'Meals saved', value: formatNumber(impact.meals), icon: UtensilsCrossed },
            { label: 'Kg food diverted', value: formatNumber(impact.kg), icon: Leaf },
            { label: 'kg CO₂e avoided', value: formatNumber(impact.co2), icon: Sparkles },
            { label: 'Verified NGOs', value: formatNumber(impact.activeNgos), icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-extrabold tabular-nums text-slate-900">{stat.value}</p>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Four steps from a full tray to a full plate.
          </h2>
          <p className="mt-3 text-slate-600">
            The platform coordinates the handoff. The donor and the receiving NGO
            remain responsible for food safety.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">Our differentiator</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Smart alerts keep food moving.
            </h2>
            <p className="mt-3 max-w-xl text-emerald-100/90">
              When a donor lists food, FRESH alerts the three nearest verified
              NGOs. If nobody responds within the demo window, it automatically
              escalates to the next three — visibly, on the donor&apos;s page.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-emerald-50">
              <li className="flex items-start gap-2"><CheckDot /> Urgency is rule-based on the pickup deadline, not a black box.</li>
              <li className="flex items-start gap-2"><CheckDot /> Escalation is visible step by step, with distances.</li>
              <li className="flex items-start gap-2"><CheckDot /> Final safety inspection always stays with the receiving NGO.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-700 bg-emerald-800/60 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Smart alert panel</p>
              <span className="rounded-full bg-amber-400/20 px-2 py-1 text-[11px] font-bold text-amber-200">DEMO</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                { name: 'Roti Bank Delhi', distance: '2.1 km', status: 'Alerted' },
                { name: 'Feeding India Delhi', distance: '3.4 km', status: 'Alerted' },
                { name: 'No Food Waste Delhi', distance: '4.8 km', status: 'Alerted' },
              ].map((ngo) => (
                <div key={ngo.name} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-white">{ngo.name}</p>
                    <p className="text-xs text-emerald-100/80">{ngo.distance} away</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[11px] font-semibold text-emerald-100">{ngo.status}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-emerald-100/70">
              No response in 60 seconds → next 3 nearest verified NGOs are added automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Aligned with the SDGs</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Small handoffs, wider impact.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SDGS.map((sdg) => (
            <div key={sdg.number} className={`rounded-2xl p-4 ring-1 ${sdg.color}`}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">SDG {sdg.number}</p>
              <h3 className="mt-1 text-sm font-extrabold">{sdg.title}</h3>
              <p className="mt-1 text-xs leading-relaxed opacity-80">{sdg.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Assumptions used for impact estimates: 1 serving = 0.4 kg food, and 1 kg
          food saved = 2.5 kg CO₂e avoided.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-10 text-white shadow-xl sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Have surplus food today?</h2>
              <p className="mt-2 max-w-xl text-emerald-50">
                List it in under a minute. A verified NGO nearby can accept the
                pickup before the window closes.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link to={donorTarget} className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-emerald-800 hover:bg-emerald-50">
                Donate food
              </Link>
              <Link to={ngoTarget} className="rounded-xl border border-white/50 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/10">
                Join as an NGO
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function CheckDot() {
  return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
}
