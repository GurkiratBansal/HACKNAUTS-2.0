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
    <main className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-fresh-light-bg dark:bg-fresh-dark-bg">
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-7 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fresh-border bg-fresh-light-card px-3.5 py-1.5 text-xs font-semibold text-fresh-mint shadow-fresh-sm dark:bg-fresh-dark-card">
            <ShieldCheck className="h-3.5 w-3.5 text-fresh-mint" aria-hidden="true" />
            Join the sharing network
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-fresh-ink dark:text-fresh-light-bg sm:text-4xl">
            Create your FRESH account
          </h1>
          <p className="mt-2 text-fresh-ink-muted dark:text-fresh-ink-soft">
            Frontend-only access. Your details stay in this browser.
          </p>
        </div>

        <div className="rounded-[12px] border border-fresh-border bg-fresh-light-card p-5 shadow-fresh-sm dark:bg-fresh-dark-card sm:p-8">
          <div
            className="grid grid-cols-2 gap-2 rounded-[8px] bg-black/5 p-1.5 border border-fresh-border dark:bg-white/5"
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
                className={`rounded-[6px] border px-3 py-2.5 text-left transition ${
                  role === tab.key
                    ? 'border-fresh-mint/30 bg-fresh-light-card text-fresh-mint shadow-fresh-sm dark:bg-fresh-dark-card'
                    : 'border-transparent text-fresh-ink-muted hover:text-fresh-ink dark:text-fresh-ink-soft'
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm font-bold">
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-fresh-ink-muted dark:text-fresh-ink-soft">
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

            <div className="flex items-start gap-2 rounded-[8px] border border-fresh-border bg-black/5 p-3 text-[13px] leading-relaxed text-fresh-ink-muted dark:bg-white/5 dark:text-fresh-ink-soft">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fresh-mint" aria-hidden="true" />
              <p>
                By registering you agree to the platform-role wording on the{' '}
                <Link to="/terms" className="font-semibold underline underline-offset-4 text-fresh-mint">
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

          <p className="mt-5 text-center text-sm text-fresh-ink-muted dark:text-fresh-ink-soft">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-fresh-mint underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
