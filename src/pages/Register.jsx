import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, ShieldCheck, UtensilsCrossed } from 'lucide-react'
import { useApp } from '../context/AppContext'

const empty = {
  name: '',
  orgName: '',
  email: '',
  phone: '',
  city: 'New Delhi',
}

export default function Register() {
  const { register } = useApp()
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
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) next.phone = 'Enter a valid phone number.'
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

  return (
    <main className="bg-[#fbfaf7]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Create your FRESH account</h1>
          <p className="mt-2 text-slate-600">
            Frontend-only demo. Your details stay in this browser.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Choose account type">
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
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  role === tab.key ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="inline-flex items-center gap-2"><tab.icon className="h-4 w-4" /> {tab.label}</span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{tab.text}</span>
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
              hint={role === 'donor' ? 'Optional. Individuals can use their own name.' : 'Use the name your community knows.'}
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
                required
              />
              <Field
                id="reg-city"
                label="City / area"
                value={form.city}
                onChange={set('city')}
                error={errors.city}
                placeholder="New Delhi"
                required
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900 ring-1 ring-emerald-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                By registering you agree to the platform-role wording on the{' '}
                <Link to="/terms" className="font-semibold underline">Trust &amp; safety page</Link>.
                FRESH is a technology connector and does not inspect food.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Create {role === 'ngo' ? 'NGO' : 'donor'} account <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

function Field({ id, label, error, hint, required, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/30'
        }`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}
