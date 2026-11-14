import { ArrowRight, ListChecks, MapPin, ShieldCheck } from 'lucide-react'
import Button from '../ui/Button'
import SidePanel from './SidePanel'
import { URGENCY_DISCLAIMER } from '../../utils/urgency'

const READINESS = [
  'Confirm storage and packaging with the donor.',
  'Bring insulated containers for hot or chilled food.',
  'Inspect every tray before you distribute it.',
]

export default function NgoSidePanels() {
  return (
    <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
      <SidePanel icon={ListChecks} title="Pickup readiness" tone="brand">
        <ul className="space-y-2.5">
          {READINESS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-xl bg-surface/70 p-2.5 text-[11px] font-medium text-ink-soft ring-1 ring-inset ring-line">
          The final safety decision always stays with your team.
        </p>
      </SidePanel>

      <SidePanel icon={MapPin} title="Wider view" tone="saffron">
        <p>
          See every open listing as a map pin, with urgency colours and the
          distance from your base.
        </p>
        <Button
          to="/map"
          variant="outline"
          size="sm"
          icon={MapPin}
          className="mt-3 w-full"
        >
          Open nearby map
        </Button>
        <Button
          to="/impact"
          variant="ghost"
          size="sm"
          iconRight={ArrowRight}
          className="mt-1 w-full"
        >
          View network impact
        </Button>
      </SidePanel>

      <SidePanel icon={ShieldCheck} title="Safety comes first" tone="neutral">
        <p>{URGENCY_DISCLAIMER}</p>
        <p className="mt-2">
          Report any concern from a listing page. Reports are stored locally in
          this browser and shown to the donor.
        </p>
      </SidePanel>
    </aside>
  )
}
