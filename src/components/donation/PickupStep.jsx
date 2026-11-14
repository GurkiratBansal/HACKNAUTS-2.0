import { MapPin, ShieldAlert } from 'lucide-react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import MapView from '../MapView'
import LocationBar from '../LocationBar'
import LocationPicker from '../LocationPicker'
import StepHeading from './StepHeading'
import { useUserLocation } from '../../context/LocationContext'

export default function PickupStep({
  form,
  set,
  errors,
  location,
  onMapClick,
  onUseLocation,
}) {
  const { place } = useUserLocation()

  return (
    <section aria-labelledby="wizard-step-title">
      <StepHeading eyebrow="Step 3 · Where" title="Set the pickup point">
        Place the pin where your team can hand the food over, not a general
        neighbourhood.
      </StepHeading>

      <div className="mt-5">
        <Field
          id="food-address"
          label="Address / landmark"
          value={form.address}
          onChange={set('address')}
          error={errors.address}
          placeholder="12, Model Town"
          required
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          icon={MapPin}
          onClick={onUseLocation}
        >
          Use my current location
        </Button>
        <span className="text-xs text-ink-soft">
          or tap the map to place the pin
        </span>
      </div>

      {!place ? (
        <LocationPicker idPrefix="add-donation-location-picker" className="mt-4" />
      ) : (
        <>
          <LocationBar className="mt-4" />
          <div className="mt-3">
            <MapView
              center={[place.lat, place.lng]}
              zoom={13}
              height="260px"
              onMapClick={onMapClick}
              markers={
                location
                  ? [
                      {
                        id: 'pickup',
                        lat: location.lat,
                        lng: location.lng,
                        color: 'var(--fresh-urgency-fresh)',
                        title: 'Pickup point',
                        popup: (
                          <p className="text-xs font-semibold text-ink">
                            Pickup point
                          </p>
                        ),
                      },
                    ]
                  : []
              }
            />
            {errors.location && (
              <p
                role="alert"
                className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-danger-600 dark:text-danger-400"
              >
                <ShieldAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {errors.location}
              </p>
            )}
            {location && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1.5 text-xs text-ink-soft ring-1 ring-inset ring-line">
                <MapPin
                  className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-300"
                  aria-hidden="true"
                />
                Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
