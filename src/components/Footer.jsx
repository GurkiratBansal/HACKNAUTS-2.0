import { Link } from 'react-router-dom'
import { HeartHandshake, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import Brand from './Brand'

const quickLinks = [
  { to: '/map', label: 'Nearby map' },
  { to: '/impact', label: 'Impact dashboard' },
  { to: '/terms', label: 'Trust & safety' },
  { to: '/donor/add', label: 'List surplus food' },
  { to: '/login', label: 'Log in' },
]

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-brand-950 text-brand-100">
      <div className="pointer-events-none absolute inset-0 pattern-rings opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.25fr_0.8fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="inline-block" aria-label="FRESH home">
            <Brand tone="dark" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-100/75">
            FRESH is a technology connector between surplus food donors and
            verified NGOs. We coordinate the handoff — we do not prepare, store,
            transport or inspect food.
          </p>
          <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs leading-relaxed text-brand-100/70">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
            Final food safety verification rests with the donor and the receiving NGO.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
            Quick links
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-1.5 text-brand-100/80 transition hover:text-white hover:underline hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-100/80">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <span>hello@fresh.demo</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <span>+91 98100 11004</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <span>New Delhi, India · Demo network</span>
            </li>
          </ul>
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-brand-100/65">
            <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden="true" />
            Sample data for demo. No real food is listed and no real contact details are used.
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-brand-100/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FRESH · Food Reduction and Excess Sharing Hub</p>
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-brand-200">Aligned with SDG 2, 3, 11, 12 and 17.</span>
            <span aria-hidden="true">·</span>
            <span>Frontend-only hackathon demo</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
