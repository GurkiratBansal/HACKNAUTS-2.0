// FRESH:FILE  Terms, safety declaration and data notes page.
// FRESH:AREA  Layout

import { AlertTriangle, FileText, ShieldCheck, Truck } from 'lucide-react'
import Button from '../components/ui/Button'

function Card({ title, icon: Icon, children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-line bg-surface shadow-card',
    warning:
      'border-warning-200 bg-warning-50/80 shadow-soft dark:border-warning-800 dark:bg-warning-900/20',
  }

  return (
    <section className={`rounded-3xl border p-5 sm:p-6 ${tones[tone] || tones.neutral}`}>
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        {Icon && (
          <Icon
            className="h-5 w-5 text-brand-600 dark:text-brand-300"
            aria-hidden="true"
          />
        )}
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function Terms() {
  return (
    <main className="bg-canvas">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            Trust &amp; safety
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Terms, declarations and platform role
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
            Plain-language safety rules for FRESH. Food safety is a shared
            responsibility, and the receiving NGO makes the final inspection.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <Card title="Food Donation Declaration" icon={FileText}>
            <blockquote className="mt-3 rounded-2xl border-l-4 border-brand-500 bg-brand-50/80 p-4 text-sm leading-relaxed text-ink-soft dark:bg-brand-900/25">
              I confirm the information is accurate and the food was prepared and
              handled responsibly. The receiving organization will independently
              inspect it. FRESH is a technology connector and does not prepare,
              store, transport or inspect food.
            </blockquote>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              The declaration must be ticked before a donor can publish a listing.
              False or incomplete information can lead to removal from the platform
              network and, in a real deployment, a safety review.
            </p>
          </Card>

          <Card title="Platform role" icon={ShieldCheck}>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>
                <strong className="text-ink">FRESH connects.</strong> We provide the
                listing, map, alert and status tools. We do not prepare, cook, store,
                refrigerate, transport, inspect or serve food.
              </li>
              <li>
                <strong className="text-ink">Donors are responsible.</strong> The
                donor confirms preparation and handling, keeps the food in the stated
                storage condition, and hands it over within the pickup window.
              </li>
              <li>
                <strong className="text-ink">NGOs inspect.</strong> The receiving
                organisation independently inspects the food, packaging, temperature
                and labels before accepting or distributing it.
              </li>
              <li>
                <strong className="text-ink">No safety guarantee.</strong> Urgency
                labels and safety hints are guidance only. Nothing on FRESH means food
                is guaranteed safe.
              </li>
            </ul>
          </Card>

          <Card title="Urgency disclaimer" icon={AlertTriangle} tone="warning">
            <p className="mt-2 text-sm leading-relaxed text-warning-900 dark:text-warning-100">
              Urgency is guidance only. Final food safety verification rests with the
              donor and the receiving NGO. Urgency is calculated from the pickup
              deadline using simple rules; it is not an AI model and it does not test
              the food.
            </p>
          </Card>

          <Card title="Pickup and reporting" icon={Truck}>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>
                Expired listings are hidden from NGO dashboards. A donor can still see
                the expired status on their own dashboard.
              </li>
              <li>
                Contact details are revealed to the NGO only after it accepts the
                pickup.
              </li>
              <li>
                NGOs can report unsafe food from the donation detail page. Reports are
                stored locally in this browser and shown to the donor.
              </li>
              <li>
                Status changes are timestamped: Available → Pickup Confirmed → Picked
                Up → Distributed.
              </li>
              <li>
                All data in this build is sample data and lives in the
                browser&apos;s localStorage. Do not enter real sensitive information.
              </li>
              <li>
                Location sharing keeps your current position in memory only: it is
                never written to localStorage, URLs or logs, and is never shared
                with other users. Times shown are estimates.
              </li>
            </ul>
          </Card>

          <Card title="Impact assumptions">
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              The impact dashboard estimates 1 serving = 0.4 kg of food and 1 kg of
              food saved = 2.5 kg CO₂e avoided. These assumptions are estimates
              only and are not audited environmental claims.
            </p>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/donor/add" variant="primary">
            List surplus food
          </Button>
          <Button to="/impact" variant="outline">
            See the impact dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}
