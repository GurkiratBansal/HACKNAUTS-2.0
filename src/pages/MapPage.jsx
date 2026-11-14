import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ChevronRight,
  MapPin,
  Phone,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import UrgencyBadge from '../components/UrgencyBadge'
import { haversineKm } from '../utils/distance'
import { getUrgency, URGENCY } from '../utils/urgency'
import { formatDistance } from '../utils/format'

export default function MapPage() {
  const { currentUser, donations, ngos } = useApp()
  const role = currentUser?.role || 'donor'
  const [guestView, setGuestView] = useState('ngo')
  const view = currentUser ? (role === 'ngo' ? 'donations' : 'ngos') : guestView

  const origin = currentUser?.location || { lat: 28.6139, lng: 77.209 }

  const verifiedNgos = useMemo(
    () =>
      ngos
        .filter((n) => n.verified)
        .map((n) => ({ ...n, distanceKm: haversineKm(origin, n) }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [ngos, origin],
  )

  const available = useMemo(
    () =>
      donations
        .filter((d) => d.status === 'available')
        .filter((d) => getUrgency(d.deadline).key !== 'expired')
        .map((d) => ({ ...d, distanceKm: haversineKm(origin, d.location), urgency: getUrgency(d.deadline) }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [donations, origin],
  )

  const markers = useMemo(() => {
    if (view === 'ngos') {
      return verifiedNgos.map((ngo) => ({
        id: ngo.id,
        lat: ngo.lat,
        lng: ngo.lng,
        color: '#059669',
        title: ngo.name,
        popup: (
          <div className="w-56 text-slate-800">
            <p className="text-sm font-bold">{ngo.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{ngo.focus}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified NGO
            </p>
            <p className="mt-1 text-xs text-slate-600">{ngo.city} · {formatDistance(ngo.distanceKm)} away</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-600"><Phone className="h-3 w-3" /> {ngo.phone}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Sample NGO for the demo. Donors can call to coordinate a drop-off.
            </p>
          </div>
        ),
      }))
    }
    return available.map((donation) => ({
      id: donation.id,
      lat: donation.location.lat,
      lng: donation.location.lng,
      color: donation.urgency.marker,
      title: donation.foodName,
      popup: (
        <div className="w-60 text-slate-800">
          <p className="text-sm font-bold">{donation.foodName}</p>
          <p className="mt-0.5 text-xs text-slate-500">{donation.quantity} servings · {formatDistance(donation.distanceKm)} away</p>
          <div className="mt-1.5"><UrgencyBadge urgency={donation.urgency} /></div>
          <p className="mt-1 text-[11px] text-slate-500">{donation.address}</p>
          <Link to={`/donation/${donation.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">
            View details <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      ),
    }))
  }, [view, verifiedNgos, available])

  return (
    <main className="relative h-[calc(100vh-4rem)] bg-slate-100">
      <MapView
        center={[origin.lat, origin.lng]}
        zoom={12}
        height="100%"
        className="rounded-none border-0 shadow-none"
        zoomControlPosition="bottomleft"
        markers={
          currentUser && role === 'ngo'
            ? [
                ...markers,
                {
                  id: 'my-ngo',
                  lat: origin.lat,
                  lng: origin.lng,
                  color: '#1d4ed8',
                  title: 'Your NGO location',
                  popup: (
                    <div className="w-48 text-slate-800">
                      <p className="text-sm font-bold">{currentUser.orgName}</p>
                      <p className="text-xs text-slate-500">Your registered pickup base</p>
                    </div>
                  ),
                },
              ]
            : markers
        }
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1001] flex justify-center p-3 sm:justify-start sm:p-4">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:w-80">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base font-extrabold text-slate-900">Nearby map</h1>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              {view === 'ngos' ? `${verifiedNgos.length} NGOs` : `${available.length} listings`}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {view === 'ngos'
              ? 'Verified NGOs within the demo metro area. Tap a green pin for contact details.'
              : 'Available donations are colour-coded by urgency. Tap a pin for details.'}
          </p>

          {!currentUser && (
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setGuestView('ngo')} className={`rounded-lg px-2 py-1.5 text-xs font-bold ${guestView === 'ngo' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}`}>
                <Building2 className="mr-1 inline h-3.5 w-3.5" /> NGOs
              </button>
              <button type="button" onClick={() => setGuestView('donations')} className={`rounded-lg px-2 py-1.5 text-xs font-bold ${guestView === 'donations' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}`}>
                <UtensilsCrossed className="mr-1 inline h-3.5 w-3.5" /> Food
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Fresh</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Soon</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Urgent</span>
          </div>

          <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
            {(view === 'ngos' ? verifiedNgos : available).slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">{view === 'ngos' ? item.name : item.foodName}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {view === 'ngos' ? `${item.city} · ${formatDistance(item.distanceKm)}` : `${item.quantity} servings · ${formatDistance(item.distanceKm)}`}
                  </p>
                </div>
                {view === 'ngos' ? (
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: URGENCY[item.urgency.key].marker }} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          {view === 'donations' && (
            <Link to="/ngo" className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              Open NGO dashboard <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1001] hidden justify-end p-4 sm:flex">
        <div className="pointer-events-auto rounded-xl bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-lg ring-1 ring-slate-200">
          OpenStreetMap tiles · sample data for demo
        </div>
      </div>
    </main>
  )
}
