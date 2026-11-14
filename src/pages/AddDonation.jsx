import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../context/LocationContext'
import DeclarationModal from '../components/DeclarationModal'
import BasicsStep from '../components/donation/BasicsStep'
import HandlingStep from '../components/donation/HandlingStep'
import ListingPreview from '../components/donation/ListingPreview'
import PhotoStep from '../components/donation/PhotoStep'
import PickupStep from '../components/donation/PickupStep'
import WizardNav from '../components/donation/WizardNav'
import WizardSteps from '../components/donation/WizardSteps'
import {
  STEP_FIELDS,
  buildStepValidators,
  firstStepWithErrors,
  validateAll,
} from '../components/donation/validators'
import { toLocalDateTimeInput } from '../utils/format'
import { getSafetyHint } from '../utils/urgency'

const now = new Date()
const DEFAULTS = {
  foodName: '',
  category: 'cooked',
  diet: 'veg',
  quantity: '',
  cookedAt: toLocalDateTimeInput(new Date(now.getTime() - 60 * 60 * 1000)),
  storage: 'room',
  deadline: toLocalDateTimeInput(new Date(now.getTime() + 3 * 60 * 60 * 1000)),
  address: '',
  contactPhone: '',
  notes: '',
}

/** Compress to keep localStorage under quota while retaining a useful preview. */
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 900
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = () => resolve(reader.result)
      img.src = reader.result
    }
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

export default function AddDonation() {
  const { addDonation, addToast } = useApp()
  const { place, detect } = useUserLocation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(DEFAULTS)
  const [location, setLocation] = useState(() =>
    place ? { lat: place.lat, lng: place.lng } : null,
  )
  const [preview, setPreview] = useState('')
  const [photo, setPhoto] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [declarationOpen, setDeclarationOpen] = useState(false)
  const objectUrlRef = useRef('')
  const cardRef = useRef(null)
  const panelRef = useRef(null)
  const mountedRef = useRef(false)
  const locationEditedRef = useRef(false)

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const safetyHint = useMemo(
    () => getSafetyHint(form.category, form.storage),
    [form.category, form.storage],
  )

  useEffect(() => {
    if (!place || locationEditedRef.current) return
    setLocation({ lat: place.lat, lng: place.lng })
  }, [place])

  // Move focus to the new panel and bring it into view on every step change.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    panelRef.current?.focus({ preventScroll: true })
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    cardRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [step])

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('Choose an image file for the food photo.', 'error')
      return
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    setPreview(objectUrl) // instant preview via object URL
    setPhotoBusy(true)
    const compressed = await compressImage(file)
    setPhoto(compressed) // persisted copy, kept small for localStorage
    setPhotoBusy(false)
  }

  const clearPhoto = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = ''
    setPreview('')
    setPhoto('')
  }

  const useCurrentLocation = () => {
    locationEditedRef.current = false
    detect()
  }

  // The same rules as the original single-page form, grouped by wizard step.
  const stepValidators = buildStepValidators(form, location)

  const validateStep = (index) => {
    const next = stepValidators[index] ? stepValidators[index]() : {}
    setErrors((prev) => {
      const cleared = { ...prev }
      STEP_FIELDS[index].forEach((field) => {
        delete cleared[field]
      })
      return { ...cleared, ...next }
    })
    return next
  }

  const goTo = (index) => setStep(Math.min(3, Math.max(0, index)))

  const goNext = () => {
    if (Object.keys(validateStep(step)).length > 0) return
    goTo(step + 1)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (step < 3) {
      goNext()
      return
    }
    const next = validateAll(stepValidators)
    setErrors(next)
    if (Object.keys(next).length > 0) {
      goTo(firstStepWithErrors(next))
      return
    }
    setDeclarationOpen(true)
  }

  const publish = () => {
    const donation = addDonation({ ...form, location, photo })
    setDeclarationOpen(false)
    navigate(`/donation/${donation.id}`)
  }

  return (
    <main className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            Add donation
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            List surplus food
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
            Four short steps, then a final declaration. Accurate details help
            NGOs decide quickly and collect safely.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.9fr]"
          noValidate
        >
          <div ref={cardRef} className="min-w-0 scroll-mt-24 space-y-4">
            <div className="rounded-3xl border border-line bg-surface p-4 shadow-soft sm:p-5">
              <WizardSteps current={step} onSelect={goTo} />
            </div>

            <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
              <div
                key={step}
                ref={panelRef}
                tabIndex={-1}
                role="region"
                aria-labelledby="wizard-step-title"
                className="animate-fade-up focus:outline-none"
              >
                {step === 0 && (
                  <BasicsStep form={form} set={set} errors={errors} />
                )}
                {step === 1 && (
                  <HandlingStep
                    form={form}
                    set={set}
                    errors={errors}
                    safetyHint={safetyHint}
                  />
                )}
                {step === 2 && (
                  <PickupStep
                    form={form}
                    set={set}
                    errors={errors}
                    location={location}
                    onMapClick={(next) => {
                      locationEditedRef.current = true
                      setLocation(next)
                      setErrors((prev) => ({ ...prev, location: '' }))
                    }}
                    onUseLocation={useCurrentLocation}
                  />
                )}
                {step === 3 && (
                  <PhotoStep
                    form={form}
                    set={set}
                    preview={preview}
                    photoBusy={photoBusy}
                    onPhoto={onPhoto}
                    clearPhoto={clearPhoto}
                  />
                )}
              </div>

              <WizardNav step={step} onBack={() => goTo(step - 1)} />
            </div>
          </div>

          <ListingPreview form={form} preview={preview} />
        </form>
      </div>

      <DeclarationModal
        open={declarationOpen}
        onClose={() => setDeclarationOpen(false)}
        onConfirm={publish}
        foodName={form.foodName}
      />
    </main>
  )
}
