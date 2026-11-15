// FRESH:FILE  Registration page for donor and NGO accounts.
// FRESH:AREA  Auth

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../context/LocationContext'
import IndiaOnlyScreen from '../components/IndiaOnlyScreen'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'

const empty = {
  name: '',
  orgName: '',
  email: '',
  phone: '',
  city: '',
}

export default function Register() {
  const { register } = useApp()
  const { isOutsideIndia } = useUserLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') === 'ngo' ? 'ngo' : 'donor')
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Your name is required.'
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = 'Enter a valid email address.'
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      next.phone = 'Enter a valid phone number.'
    }
    if (role === 'ngo' && !form.orgName.trim()) next.orgName = 'NGO name is required.'
    if (!form.city.trim()) next.city = 'City is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = register({ ...form, role })
    if (!result.ok) {
      setErrors({ email: result.message })
      return
    }
    navigate(role === 'ngo' ? '/ngo' : '/donor')
  }

  if (isOutsideIndia) {
    return <IndiaOnlyScreen title="Registration is available in India only" />
  }

  return (
    <main className="relative overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-35" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-800/30" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-saffron-200/30 blur-3xl dark:bg-saffron-900/20" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-7 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface/90 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-soft dark:border-brand-700 dark:text-brand-200">
            <ShieldCheck className="h-3.5 w-3.5 text-saffron-600 dark:text-saffron-400" aria-hidden="true" />
            Join the sharing network
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Create your FRESH account
          </h1>
          <p className="mt-2 text-ink-soft">
            Frontend-only access. Your details stay in this browser.
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
          <div
            className="grid grid-cols-2 gap-2 rounded-2xl bg-elevated p-1.5 ring-1 ring-line"
            role="tablist"
            aria-label="Choose account type"
          >
            {[
              { key: 'donor', label: 'Donor', icon: UtensilsCrossed, text: 'I have surplus food' },
              { key: 'ngo', label: 'NGO', icon: Building2, text: 'We distribute food' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={role === tab.key}
                onClick={() => setRole(tab.key)}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  role === tab.key
                    ? 'border-brand-300 bg-surface text-brand-700 shadow-soft dark:border-brand-700 dark:text-brand-200'
                    : 'border-transparent text-ink-muted hover:bg-surface/70 hover:text-ink'
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm font-bold">
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-ink-muted">
                  {tab.text}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="reg-name"
                label="Contact person"
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                placeholder="Asha Sharma"
                autoComplete="name"
                required
              />
              <Field
                id="reg-phone"
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
              />
            </div>

            <Field
              id="reg-org"
              label={role === 'ngo' ? 'NGO name' : 'Kitchen / business name'}
              value={form.orgName}
              onChange={set('orgName')}
              error={errors.orgName}
              placeholder={role === 'ngo' ? 'Roti Bank Delhi' : 'Spice Route Kitchen'}
              required={role === 'ngo'}
              hint={
                role === 'donor'
                  ? 'Optional. Individuals can use their own name.'
                  : 'Use the name your community knows.'
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="reg-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                placeholder="you@example.org"
                autoComplete="email"
                required
              />
              <Field
                id="reg-city"
                label="City / area"
                value={form.city}
                onChange={set('city')}
                error={errors.city}
                placeholder="Your city"
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3 text-[13px] leading-relaxed text-brand-900 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                By registering you agree to the platform-role wording on the{' '}
                <Link to="/terms" className="font-semibold underline underline-offset-4">
                  Trust &amp; safety page
                </Link>
                . FRESH is a technology connector and does not inspect food.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              className="w-full"
            >
              Create {role === 'ngo' ? 'NGO' : 'donor'} account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-200"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
