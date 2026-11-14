import { Link } from 'react-router-dom'
import { AlertTriangle, FileText, ShieldCheck, Truck } from 'lucide-react'

export default function Terms() {
  return (
    <main className="bg-[#fbfaf7]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Trust &amp; safety</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Terms, declarations and platform role
          </h1>
          <p className="mt-2 text-slate-600">
            Plain-language safety rules for the FRESH demo. Food safety is a shared
            responsibility, and the receiving NGO makes the final inspection.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FileText className="h-5 w-5 text-emerald-700" /> Food Donation Declaration
            </h2>
            <blockquote className="mt-3 border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
              I confirm the information is accurate and the food was prepared and
              handled responsibly. The receiving organization will independently
              inspect it. FRESH is a technology connector and does not prepare,
              store, transport or inspect food.
            </blockquote>
            <p className="mt-3 text-sm text-slate-600">
              The declaration must be ticked before a donor can publish a listing.
              False or incomplete information can lead to removal from the demo
              network and, in a real deployment, a safety review.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-700" /> Platform role
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <li><strong className="text-slate-900">FRESH connects.</strong> We provide the listing, map, alert and status tools. We do not prepare, cook, store, refrigerate, transport, inspect or serve food.</li>
              <li><strong className="text-slate-900">Donors are responsible.</strong> The donor confirms preparation and handling, keeps the food in the stated storage condition, and hands it over within the pickup window.</li>
              <li><strong className="text-slate-900">NGOs inspect.</strong> The receiving organisation independently inspects the food, packaging, temperature and labels before accepting or distributing it.</li>
              <li><strong className="text-slate-900">No safety guarantee.</strong> Urgency labels and safety hints are guidance only. Nothing on FRESH means food is guaranteed safe.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-950">
              <AlertTriangle className="h-5 w-5 text-amber-700" /> Urgency disclaimer
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              Urgency is guidance only. Final food safety verification rests with
              the donor and the receiving NGO. Urgency is calculated from the pickup
              deadline using simple rules; it is not an AI model and it does not test
              the food.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Truck className="h-5 w-5 text-emerald-700" /> Pickup and reporting
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <li>Expired listings are hidden from NGO dashboards. A donor can still see the expired status on their own dashboard.</li>
              <li>Contact details are revealed to the NGO only after it accepts the pickup.</li>
              <li>NGOs can report unsafe food from the donation detail page. Reports are stored locally in this demo and shown to the donor.</li>
              <li>Status changes are timestamped: Available → Pickup Confirmed → Picked Up → Distributed.</li>
              <li>All data in this build is sample data for demo and lives in the browser's localStorage. Do not enter real sensitive information.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Impact assumptions</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              The impact dashboard estimates 1 serving = 0.4 kg of food and 1 kg of
              food saved = 2.5 kg CO₂e avoided. These assumptions are for the demo
              only and are not audited environmental claims.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/donor/add" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
            List surplus food
          </Link>
          <Link to="/impact" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            See the impact dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
