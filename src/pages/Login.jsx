import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Leaf,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, quickLogin } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialRole = params.get('role') === 'ngo' ? 'ngo' : 'donor'
  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const go = (r) => navigate(r === 'ngo' ? '/ngo' : '/donor')

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Enter the email you registered with, or use a quick demo login.')
      return
    }
    const result = login(email, role)
    if (!result.ok) {
      setError(result.message)
      return
    }
    go(role)
  }

  const demo = (r) => {
    quickLogin(r)
    go(r)
  }

  return (
    <main className="relative overflow-hidden bg-[#fbfaf7]">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            <Leaf className="h-3.5 w-3.5" /> FRESH demo
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">
            Good food deserves a second chance.
          </h1>
          <p className="mt-4 max-w-md text-slate-600">
            Log in as a donor to list surplus food, or as an NGO to discover and
            accept nearby pickups.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: UtensilsCrossed, title: 'Donors', text: 'Restaurants, kitchens, banquet halls, individuals.' },
              { icon: Building2, title: 'NGOs', text: 'Verified organisations that collect and distribute.' },
              { icon: ShieldCheck, title: 'Safety first', text: 'The receiving NGO always inspects the food.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a role, then log in or jump straight into a demo.</p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Choose role">
            {[
              { key: 'donor', label: 'Donor', icon: UtensilsCrossed },
              { key: 'ngo', label: 'NGO', icon: Building2 },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={role === tab.key}
                onClick={() => {
                  setRole(tab.key)
                  setError('')
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  role === tab.key ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder={role === 'donor' ? 'donor@fresh.demo' : 'ngo@fresh.demo'}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Demo mode: any password"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <p className="mt-1 text-xs text-slate-500">Demo authentication is frontend-only. No password is checked.</p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-100" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Log in as {role === 'donor' ? 'donor' : 'NGO'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">or skip the form</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => demo('donor')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
            >
              <Sparkles className="h-4 w-4" /> Quick demo donor
            </button>
            <button
              type="button"
              onClick={() => demo('ngo')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2.5 text-sm font-bold text-orange-800 hover:bg-orange-100"
            >
              <Sparkles className="h-4 w-4" /> Quick demo NGO
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
