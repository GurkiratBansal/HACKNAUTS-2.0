// FRESH:FILE  Site footer: dark forest background, hairline borders, navigation links and safety disclaimers.
// FRESH:AREA  Layout

import { Link } from 'react-router-dom'
import { HeartHandshake, Mail, MapPin, ShieldCheck } from 'lucide-react'
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
    <footer className="relative mt-20 border-t border-white/10 bg-[#06130F] text-[#F2F7F4]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_0.8fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="inline-block">
            <Brand tone="dark" />
          </Link>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#A9BBB2]">
            FRESH connects surplus food donors with verified local NGOs through
            real-time discovery, urgency sorting, and road routing. India only for now.
          </p>
          <div className="mt-4 inline-flex items-start gap-2.5 rounded-[10px] border border-white/10 bg-[#0B2219]/60 p-3 text-xs leading-relaxed text-[#A9BBB2]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3EE6B8]" aria-hidden="true" />
            <span>
              Urgency is guidance only. Final food safety checks rest with the donor
              and the receiving organization.
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3EE6B8]">
            Platform
          </h2>
          <ul className="mt-4 space-y-2.5 text-xs">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-1.5 text-[#A9BBB2] transition hover:text-[#3EE6B8]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3EE6B8]">
            Transparency &amp; Demo
          </h2>
          <div className="mt-4 space-y-3 text-xs text-[#A9BBB2]">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3EE6B8]" aria-hidden="true" />
              <span>Coordinated across Indian municipal districts</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#3EE6B8]" aria-hidden="true" />
              <span>demo@fresh.network</span>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-white/10 bg-[#0B2219]/60 p-3 text-xs leading-relaxed text-[#A9BBB2]">
            <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#19C8D8]" aria-hidden="true" />
            <span>Sample data for demo. All volunteer listings are mock records for evaluation.</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#040C0A]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-[#A9BBB2] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FRESH · Food Reduction and Excess Sharing Hub</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#3EE6B8]">Aligned with UN SDG 2, 3, 11, 12, 17</span>
            <span aria-hidden="true">·</span>
            <span>Sample data for demo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
