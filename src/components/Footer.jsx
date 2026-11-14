import { Link } from 'react-router-dom'
import { Leaf, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">FRESH</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-600">
            A technology connector between surplus food donors and verified
            NGOs. FRESH does not prepare, store, transport or inspect food.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link className="hover:text-emerald-700" to="/map">Nearby map</Link></li>
            <li><Link className="hover:text-emerald-700" to="/impact">Impact dashboard</Link></li>
            <li><Link className="hover:text-emerald-700" to="/terms">Trust &amp; safety</Link></li>
            <li><Link className="hover:text-emerald-700" to="/donor/add">List surplus food</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Safety first
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Urgency is guidance only. Final food safety verification rests
            with the donor and the receiving NGO.
          </p>
          <p className="mt-3 text-xs text-slate-500">Sample data for demo. No real food is listed here.</p>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} FRESH · Built for a hackathon demo · Frontend only
      </div>
    </footer>
  )
}
