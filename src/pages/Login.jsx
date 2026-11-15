// FRESH:FILE  Login page with demo accounts and role selection.
// FRESH:AREA  Auth

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Leaf,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'

const PROMISES = [
  {
    icon: UtensilsCrossed,
    title: 'Donors',
    text: 'Restaurants, kitchens, banquet halls and individuals.',
  },
  {
    icon: Building2,
    title: 'NGOs',
    text: 'Verified organisations that collect and distribute.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety first',
    text: 'The receiving NGO always inspects the food.',
  },
]

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
      setError('Enter the email you registered with, or use a quick login.')
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
    <main className="relative overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-800/30" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-saffron-200/40 blur-3xl dark:bg-saffron-900/20" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.02fr] lg:gap-14 lg:px-8 lg:py-16">
        <div className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface/90 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-soft dark:border-brand-700 dark:text-brand-200">
            <Leaf className="h-3.5 w-3.5 text-saffron-600 dark:text-saffron-400" aria-hidden="true" />
            FRESH access
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink xl:text-5xl">
            Good food deserves a second chance.
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
            Log in as a donor to list surplus food, or as an NGO to discover and
            accept nearby pickups.
          </p>

          <div className="mt-8 space-y-3">
            {PROMISES.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-line bg-surface/80 p-4 shadow-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
            Frontend access. Sample accounts and listings stay in this browser.
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Welcome back
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Choose a role, then log in or continue with a sample account.
          </p>

          <div
            className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-elevated p-1 ring-1 ring-line"
            role="tablist"
            aria-label="Choose role"
          >
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
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                  role === tab.key
                    ? 'bg-surface text-brand-700 shadow-soft ring-1 ring-line dark:text-brand-200'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <Field
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder={role === 'donor' ? 'donor@fresh.network' : 'ngo@fresh.network'}
            />

            <Field
              id="login-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Any password"
              hint="Frontend authentication is local. No password is checked."
            />

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2.5 text-[13px] font-medium leading-relaxed text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              className="w-full"
            >
              Log in as {role === 'donor' ? 'donor' : 'NGO'}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              or skip the form
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              icon={Sparkles}
              onClick={() => demo('donor')}
              className="w-full"
            >
              Quick donor login
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={Sparkles}
              onClick={() => demo('ngo')}
              className="w-full"
            >
              Quick NGO login
            </Button>
          </div>

          <p className="mt-5 text-center text-sm text-ink-muted">
            New here?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-200"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
