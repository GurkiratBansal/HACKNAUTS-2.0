import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import UrgencyBadge from '../components/UrgencyBadge'
import CountdownTimer from '../components/CountdownTimer'
import StatusStepper from '../components/StatusStepper'
import ReportModal from '../components/ReportModal'
import EmptyState from '../components/EmptyState'
import { haversineKm } from '../utils/distance'
import {
  categoryLabel,
  formatDate,
  formatDistance,
  formatTime,
  storageLabel,
} from '../utils/format'
import { getSafetyHint, getUrgency, URGENCY_DISCLAIMER } from '../utils/urgency'

export default function DonationDetail() {
  const { id } = useParams()
  const { donations, ngos, currentUser, acceptDonation, advanceStatus, reportDonation } = useApp()
  const [reportOpen, setReportOpen] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Light ticker for the demo escalation countdown.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const donation = donations.find((d) => d.id === id)

  const alerted = useMemo(() => {
    if (!donation) return []
    return (donation.alertedNgoIds || [])
      .map((ngoId) => ngos.find((n) => n.id === ngoId))
      .filter(Boolean)
      .map((ngo) => ({ ...ngo, distanceKm: haversineKm(donation.location, ngo) }))
  }, [donation, ngos])

  if (!donation) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={UtensilsCrossed}
          title="Listing not found"
          description="It may have been removed, or the link is incomplete."
          action={<Link to="/" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white">Back to home</Link>}
        />
      </main>
    )
  }

  const urgency = getUrgency(donation.deadline, now)
  const isExpired = urgency.key === 'expired' && donation.status === 'available'
  const isDonor = currentUser?.role === 'donor' && currentUser.id === donation.donorId
  const isNgo = currentUser?.role === 'ngo'
  const acceptedByMe =
    isNgo &&
    donation.acceptedBy &&
    (donation.acceptedBy === currentUser?.ngoId ||
      donation.acceptedByName === currentUser?.orgName)
  const canAccept = isNgo && donation.status === 'available' && !isExpired
  const canAdvance = acceptedByMe && (donation.status === 'accepted' || donation.status === 'picked_up')
  const contactVisible = isDonor || Boolean(acceptedByMe)
  const acceptedNgo =
    ngos.find((n) => n.id === donation.acceptedBy) ||
    (donation.acceptedBy
      ? {
          id: donation.acceptedBy,
          name: donation.acceptedByName || 'Registered NGO',
          focus: 'Registered FRESH NGO account',
          phone: donation.acceptedByPhone || '',
          verified: false,
        }
      : null)
  const showAlertPanel = donation.status === 'available' || donation.status === 'accepted'
  const escalationMs = 60000 - (now - new Date(donation.createdAt).getTime())
  const waitingForEscalation = donation.status === 'available' && donation.alertStage === 1 && escalationMs > 0
  const stage2 = donation.alertStage >= 2

  const firstThree = alerted.slice(0, 3)
  const laterThree = alerted.slice(3)
  const acceptedNgoId = donation.acceptedBy

  const markers = [
    {
      id: 'donation',
      lat: donation.location.lat,
      lng: donation.location.lng,
      color: urgency.marker,
      title: donation.foodName,
      popup: <p className="text-xs font-semibold text-slate-800">{donation.foodName}</p>,
    },
    ...alerted.slice(0, 6).map((ngo) => ({
      id: ngo.id,
      lat: ngo.lat,
      lng: ngo.lng,
      color: '#0284c7',
      title: ngo.name,
      popup: <p className="text-xs font-semibold text-slate-800">{ngo.name}</p>,
    })),
  ]

  return (
    <main className="bg-[#fbfaf7]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to={isNgo ? '/ngo' : '/donor'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-64 bg-gradient-to-br from-emerald-100 via-orange-50 to-emerald-50 sm:h-80">
                {donation.photo ? (
                  <img src={donation.photo} alt={donation.foodName} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <div className="flex h-full items-center justify-center text-emerald-700/50"><UtensilsCrossed className="h-14 w-14" /></div>
                )}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {donation.status === 'available' ? (
                    <UrgencyBadge urgency={urgency} />
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        donation.status === 'accepted'
                          ? 'bg-sky-50 text-sky-800 ring-sky-200'
                          : donation.status === 'picked_up'
                            ? 'bg-violet-50 text-violet-800 ring-violet-200'
                            : 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                      }`}
                    >
                      {donation.status === 'accepted'
                        ? 'Pickup Confirmed'
                        : donation.status === 'picked_up'
                          ? 'Picked Up'
                          : 'Distributed'}
                    </span>
                  )}
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    {donation.quantity} servings
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{donation.foodName}</h1>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                      <span>{categoryLabel(donation.category)}</span>
                      <span aria-hidden="true">·</span>
                      <span className={donation.diet === 'veg' ? 'font-semibold text-emerald-700' : 'font-semibold text-orange-700'}>
                        {donation.diet === 'veg' ? 'Veg' : 'Non-veg'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{storageLabel(donation.storage)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isNgo && (
                      <button type="button" onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
                        <AlertTriangle className="h-4 w-4" /> Report unsafe food
                      </button>
                    )}
                    {canAccept && (
                      <button type="button" onClick={() => acceptDonation(donation.id)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Accept pickup
                      </button>
                    )}
                    {canAdvance && (
                      <button
                        type="button"
                        onClick={() => advanceStatus(donation.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                      >
                        <Truck className="h-4 w-4" />
                        {donation.status === 'accepted' ? 'Mark picked up' : 'Mark distributed'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <CountdownTimer deadline={donation.deadline} completed={donation.status === 'distributed'} />
                    <span className="text-xs text-slate-500">Deadline: {formatDate(donation.deadline)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <StatusStepper donation={donation} />
                </div>
              </div>
            </section>

            {showAlertPanel && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                      <Sparkles className="h-5 w-5 text-emerald-700" /> Smart alert simulation
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {donation.status === 'accepted'
                        ? 'An NGO accepted the alert and will coordinate the pickup.'
                        : stage2
                          ? 'No response, alerting the next nearest NGOs.'
                          : 'Alerting the 3 nearest verified NGOs…'}
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${donation.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : stage2 ? 'bg-orange-50 text-orange-700 ring-orange-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                    <span className={`h-2 w-2 rounded-full bg-current ${donation.status === 'accepted' ? '' : 'animate-pulse'}`} />
                    {donation.status === 'accepted' ? 'Accepted' : stage2 ? 'Escalated' : 'Alerting'}
                  </span>
                </div>

                {waitingForEscalation && (
                  <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 ring-1 ring-emerald-100">
                    <Clock className="mr-1.5 inline h-4 w-4" />
                    Auto-escalating in <span className="font-bold tabular-nums">{Math.ceil(escalationMs / 1000)}s</span> if no NGO accepts.
                  </div>
                )}

                {stage2 && !donation.escalatedAt && (
                  <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm text-orange-900 ring-1 ring-orange-100">
                    This listing has moved to the second alert ring.
                  </p>
                )}

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">First alert ring</p>
                  <div className="mt-2 space-y-2">
                    {firstThree.map((ngo) => (
                      <AlertRow key={ngo.id} ngo={ngo} accepted={ngo.id === acceptedNgoId} />
                    ))}
                  </div>
                </div>

                {stage2 && laterThree.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Second alert ring · escalated</p>
                    <div className="mt-2 space-y-2">
                      {laterThree.map((ngo) => (
                        <AlertRow key={ngo.id} ngo={ngo} accepted={ngo.id === acceptedNgoId} escalated />
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  Demo timer: if no NGO accepts within 60 seconds, the next three
                  nearest verified NGOs are added automatically. The panel updates
                  live on this page and on the donor dashboard.
                </p>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Pickup location</h2>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {donation.address}
              </p>
              <div className="mt-3">
                <MapView
                  center={[donation.location.lat, donation.location.lng]}
                  zoom={13}
                  height="260px"
                  markers={markers}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Handling details</h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                <Row term="Cooked / packed" value={formatDate(donation.cookedAt)} />
                <Row term="Storage" value={storageLabel(donation.storage)} />
                <Row term="Listed" value={formatDate(donation.createdAt)} />
                <Row term="Pickup deadline" value={formatDate(donation.deadline)} />
                <Row term="Category" value={categoryLabel(donation.category)} />
                <Row term="Diet" value={donation.diet === 'veg' ? 'Veg' : 'Non-veg'} />
              </dl>
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-100">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {getSafetyHint(donation.category, donation.storage)}
              </p>
              {donation.notes && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Donor notes: </span>{donation.notes}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Contacts</h2>
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><UserRound className="h-3.5 w-3.5" /> Donor</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{donation.donorName}</p>
                  {contactVisible ? (
                    <a href={`tel:${donation.contactPhone.replace(/\s/g, '')}`} className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline">
                      <Phone className="h-3.5 w-3.5" /> {donation.contactPhone}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-500">Contact is revealed to the NGO that accepts the pickup.</p>
                  )}
                </div>

                {acceptedNgo && (
                  <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Accepted by</p>
                    <p className="mt-1 text-sm font-bold text-emerald-900">{acceptedNgo.name}</p>
                    <p className="text-xs text-emerald-800">{acceptedNgo.focus}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
                      {acceptedNgo.verified ? 'Verified NGO' : 'Registered NGO · verification pending'}
                    </p>
                    {acceptedNgo.phone && (
                      <a href={`tel:${acceptedNgo.phone.replace(/\s/g, '')}`} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {acceptedNgo.phone}
                      </a>
                    )}
                  </div>
                )}

                {!currentUser && (
                  <Link to="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                    Log in to accept or manage this pickup
                  </Link>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Status timeline</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {donation.timeline.map((entry, index) => (
                  <li key={`${entry.status}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="font-semibold capitalize text-slate-700">{entry.status.replace('_', ' ')}</span>
                    <span className="text-xs text-slate-500">{formatTime(entry.at)}</span>
                  </li>
                ))}
              </ol>
            </section>

            {(donation.reports?.length > 0) && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <p className="font-bold">{donation.reports.length} safety report{donation.reports.length > 1 ? 's' : ''}</p>
                <p className="mt-1 text-xs">Reports are stored locally in this demo and visible to the donor.</p>
              </section>
            )}

            <p className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-500 ring-1 ring-slate-200">
              {URGENCY_DISCLAIMER} FRESH never guarantees that food is safe.
            </p>
          </aside>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(report) => {
          reportDonation(donation.id, report)
          setReportOpen(false)
        }}
        foodName={donation.foodName}
      />
    </main>
  )
}

function Row({ term, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{term}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

function AlertRow({ ngo, accepted, escalated = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ring-1 ${accepted ? 'bg-emerald-50 ring-emerald-200' : escalated ? 'bg-orange-50/60 ring-orange-100' : 'bg-slate-50 ring-slate-200'}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">{ngo.name}</p>
        <p className="truncate text-xs text-slate-500">
          {ngo.focus} · {formatDistance(ngo.distanceKm)} away
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${accepted ? 'bg-emerald-600 text-white' : escalated ? 'bg-orange-100 text-orange-800' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
        {accepted ? 'Accepted' : escalated ? 'Escalated' : 'Alerted'}
      </span>
    </div>
  )
}
