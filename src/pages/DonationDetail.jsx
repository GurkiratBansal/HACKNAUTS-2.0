import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, UtensilsCrossed } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../context/LocationContext'
import Button from '../components/ui/Button'
import EmptyState from '../components/EmptyState'
import ReportModal from '../components/ReportModal'
import AlertPanel from '../components/detail/AlertPanel'
import DetailAside from '../components/detail/DetailAside'
import DetailHero from '../components/detail/DetailHero'
import PickupMap from '../components/detail/PickupMap'
import { haversineKm } from '../utils/distance'
import { getUrgency } from '../utils/urgency'
import { useRoute } from '../hooks/useRoute'

export default function DonationDetail() {
  const { id } = useParams()
  const {
    donations,
    ngos,
    currentUser,
    acceptDonation,
    advanceStatus,
    reportDonation,
  } = useApp()
  const { place } = useUserLocation()
  const [reportOpen, setReportOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [routeKey, setRouteKey] = useState(0)
  const [routeInfo, setRouteInfo] = useState(null)

  // Light ticker for the escalation countdown.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const donation = donations.find((entry) => entry.id === id)
  const routeResult = useRoute(place, donation?.location, routeKey)

  const alerted = useMemo(() => {
    if (!donation || !place) return []
    return (donation.alertedNgoIds || [])
      .map((ngoId) => ngos.find((ngo) => ngo.id === ngoId))
      .filter(Boolean)
      .map((ngo) => ({ ...ngo, distanceKm: haversineKm(place, ngo) }))
  }, [donation, ngos, place])

  if (!donation) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={UtensilsCrossed}
          title="Listing not found"
          description="It may have been removed, or the link is incomplete."
          action={
            <Button to="/" variant="secondary">
              Back to home
            </Button>
          }
        />
      </main>
    )
  }

  const urgency = getUrgency(donation.deadline, now)
  const isExpired = urgency.key === 'expired' && donation.status === 'available'
  const isDonor =
    currentUser?.role === 'donor' && currentUser.id === donation.donorId
  const isNgo = currentUser?.role === 'ngo'
  const acceptedByMe =
    isNgo &&
    donation.acceptedBy &&
    (donation.acceptedBy === currentUser?.ngoId ||
      donation.acceptedByName === currentUser?.orgName)
  const canAccept = isNgo && donation.status === 'available' && !isExpired
  const canAdvance =
    acceptedByMe &&
    (donation.status === 'accepted' || donation.status === 'picked_up')
  const contactVisible = isDonor || Boolean(acceptedByMe)
  const acceptedNgo =
    ngos.find((ngo) => ngo.id === donation.acceptedBy) ||
    (donation.acceptedBy
      ? {
          id: donation.acceptedBy,
          name: donation.acceptedByName || 'Registered NGO',
          focus: 'Registered FRESH NGO account',
          phone: donation.acceptedByPhone || '',
          verified: false,
        }
      : null)
  const showAlertPanel =
    donation.status === 'available' || donation.status === 'accepted'
  const escalationMs = 60000 - (now - new Date(donation.createdAt).getTime())
  const waitingForEscalation =
    donation.status === 'available' &&
    donation.alertStage === 1 &&
    escalationMs > 0
  const stage2 = donation.alertStage >= 2

  return (
    <main className="bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to={isNgo ? '/ngo' : '/donor'}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-ink-muted transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="min-w-0 space-y-6">
            <DetailHero
              donation={donation}
              urgency={urgency}
              isNgo={isNgo}
              canAccept={canAccept}
              canAdvance={canAdvance}
              onAccept={() => acceptDonation(donation.id)}
              onAdvance={() => advanceStatus(donation.id)}
              onReport={() => setReportOpen(true)}
            />

            {showAlertPanel && (
              <AlertPanel
                donation={donation}
                stage2={stage2}
                waitingForEscalation={waitingForEscalation}
                escalationMs={escalationMs}
                firstThree={alerted.slice(0, 3)}
                laterThree={alerted.slice(3)}
                acceptedNgoId={donation.acceptedBy}
              />
            )}

            <PickupMap
              donation={donation}
              urgency={urgency}
              alerted={alerted}
              place={place}
              route={routeResult.route}
              routeLoading={routeResult.loading}
              routeError={routeResult.error}
              routeInfo={routeInfo}
              onRouteInfo={setRouteInfo}
              onRequestRoute={() => setRouteKey((key) => key + 1)}
              onClearRoute={() => {
                setRouteKey(0)
                setRouteInfo(null)
              }}
              googleMapsUrl={
                place
                  ? `https://www.google.com/maps/dir/?api=1&destination=${donation.location.lat},${donation.location.lng}`
                  : undefined
              }
            />
            {isNgo && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setRouteKey((key) => key + 1)}
                  variant="primary"
                  size="md"
                >
                  Show route to pickup
                </Button>
              </div>
            )}
          </div>

          <DetailAside
            donation={donation}
            acceptedNgo={acceptedNgo}
            contactVisible={contactVisible}
            currentUser={currentUser}
          />
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
