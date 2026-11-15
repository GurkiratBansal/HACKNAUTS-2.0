// FRESH:FILE  Multi-step donation wizard; validates each step then publishes via AppContext.
// FRESH:AREA  Donations

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../context/LocationContext'
// CHANGED: removed an unused Button import that failed lint; nothing else touched.
import DeclarationModal from '../components/DeclarationModal'
import IndiaOnlyScreen from '../components/IndiaOnlyScreen'
import BasicsStep from '../components/donation/BasicsStep'
import HandlingStep from '../components/donation/HandlingStep'
import ListingPreview from '../components/donation/ListingPreview'
import PhotoStep from '../components/donation/PhotoStep'
import PickupStep from '../components/donation/PickupStep'
import VoiceDonationAssistant from '../components/donation/VoiceDonationAssistant'
import AiScanModal from '../components/donation/AiScanModal'
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
import { useEmergency } from '../context/EmergencyContext'

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
  const { place, detect, isOutsideIndia } = useUserLocation()
  const { activeAlert } = useEmergency()
  const navigate = useNavigate()
  const emergencyActive = Boolean(activeAlert(place))
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
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false)
  const [aiScanOpen, setAiScanOpen] = useState(false)
  const [scanFile, setScanFile] = useState(null)
  const [nutrition, setNutrition] = useState(null)
  const [safetyData, setSafetyData] = useState(null)
  const fileInputRef = useRef(null)
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
    setScanFile(file)
    setPhotoBusy(true)
    const compressed = await compressImage(file)
    setPhoto(compressed) // persisted copy, kept small for localStorage
    setPhotoBusy(false)

    // Trigger AI Food Safety & Nutrition Vision Scanner!
    setAiScanOpen(true)
  }

  const clearPhoto = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = ''
    setPreview('')
    setPhoto('')
    setNutrition(null)
    setSafetyData(null)
  }

  const useCurrentLocation = () => {
    locationEditedRef.current = false
    if (place) {
      setLocation({ lat: place.lat, lng: place.lng })
      setErrors((prev) => ({ ...prev, location: '' }))
    }
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

  const applyVoiceValues = (values) => {
    setForm((prev) => ({
      ...prev,
      ...(values.foodName ? { foodName: values.foodName } : {}),
      ...(values.quantity ? { quantity: values.quantity } : {}),
      ...(values.cookedAt ? { cookedAt: values.cookedAt } : {}),
      ...(values.deadline ? { deadline: values.deadline } : {}),
      ...(values.address ? { address: values.address } : {}),
      ...(values.contactPhone ? { contactPhone: values.contactPhone } : {}),
    }))
    setErrors({})
    addToast('Voice details applied to donation form!', 'success')
  }

  const applyAiAnalysis = (analysis) => {
    setForm((prev) => ({
      ...prev,
      foodName: analysis.foodName,
      category: analysis.category,
      diet: analysis.diet,
      quantity: analysis.quantity,
      storage: analysis.storage,
      notes: analysis.suggestedNotes,
    }))
    setNutrition(analysis.nutrition)
    setSafetyData({
      safetyScore: analysis.safetyScore,
      safetyVerdict: analysis.safetyVerdict,
      safetyChecks: analysis.safetyChecks,
    })
    setErrors({})
    addToast(
      `✨ AI analyzed "${analysis.foodName}"! Everything is filled — now set Made Time & Expiry Time.`,
      'success',
    )
    goTo(1)
  }

  const publish = () => {
    const donation = addDonation({
      ...form,
      location,
      photo,
      nutrition,
      safetyData,
    })
    setDeclarationOpen(false)
    navigate(`/donation/${donation.id}`)
  }

  if (isOutsideIndia) {
    return <IndiaOnlyScreen title="Donating food is available in India only" />
  }

  return (
    <main className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (preview) {
                  setAiScanOpen(true)
                } else {
                  fileInputRef.current?.click()
                }
              }}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-soft transition-all duration-300 hover:border-emerald-500 hover:shadow-card active:scale-[0.98] dark:border-emerald-700/60 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-brand-950/40 dark:text-emerald-100"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs transition-transform group-hover:scale-110">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col text-left">
                <span className="leading-tight">AI Food &amp; Safety Scan</span>
                <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-300/80">Auto-Fills Food &amp; Nutrition</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVoiceAssistantOpen(true)}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl border border-brand-300/80 bg-gradient-to-r from-brand-50 via-emerald-50 to-teal-50 px-4 py-2.5 text-sm font-bold text-brand-900 shadow-soft transition-all duration-300 hover:border-brand-500 hover:shadow-card active:scale-[0.98] dark:border-brand-700/60 dark:from-brand-950/60 dark:via-emerald-950/40 dark:to-teal-950/40 dark:text-brand-100"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs transition-transform group-hover:scale-110 group-hover:bg-brand-500">
                <Mic className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col text-left">
                <span className="leading-tight">Fill by Voice AI</span>
                <span className="text-[10px] font-semibold text-brand-700/80 dark:text-brand-300/80">Speech-to-Text Setup</span>
              </span>
            </button>

            <input
              ref={fileInputRef}
              id="ai-photo-upload-input"
              type="file"
              accept="image/*"
              onChange={onPhoto}
              className="sr-only"
            />
          </div>
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
                  <BasicsStep
                    form={form}
                    set={set}
                    errors={errors}
                    emergencyActive={emergencyActive}
                    onTriggerAiScan={() => fileInputRef.current?.click()}
                  />
                )}
                {step === 1 && (
                  <HandlingStep
                    form={form}
                    set={set}
                    errors={errors}
                    safetyHint={safetyHint}
                    nutrition={nutrition}
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
                    nutrition={nutrition}
                    safetyData={safetyData}
                    onReScan={() => setAiScanOpen(true)}
                  />
                )}
              </div>

              <WizardNav step={step} onBack={() => goTo(step - 1)} />
            </div>
          </div>

          <ListingPreview
            form={form}
            preview={preview}
            nutrition={nutrition}
            safetyData={safetyData}
          />
        </form>
      </div>

      <DeclarationModal
        open={declarationOpen}
        onClose={() => setDeclarationOpen(false)}
        onConfirm={publish}
        foodName={form.foodName}
      />

      <VoiceDonationAssistant
        open={voiceAssistantOpen}
        onClose={() => setVoiceAssistantOpen(false)}
        onApplyValues={applyVoiceValues}
      />

      <AiScanModal
        open={aiScanOpen}
        onClose={() => setAiScanOpen(false)}
        file={scanFile}
        previewUrl={preview}
        onApplyAnalysis={applyAiAnalysis}
      />
    </main>
  )
}
