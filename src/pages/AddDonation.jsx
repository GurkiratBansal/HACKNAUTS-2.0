import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Clock,
  ImagePlus,
  MapPin,
  Sparkles,
  Trash2,
  Upload,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import DeclarationModal from '../components/DeclarationModal'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import {
  categoryLabel,
  storageLabel,
  toLocalDateTimeInput,
} from '../utils/format'
import { getSafetyHint, URGENCY_DISCLAIMER } from '../utils/urgency'

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

const CATEGORIES = [
  { value: 'cooked', label: 'Cooked meal' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'raw', label: 'Raw / packaged' },
]

const STORAGE = [
  { value: 'room', label: 'Room temperature' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'hot-holding', label: 'Hot holding' },
]

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
  const { currentUser, addDonation, addToast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(DEFAULTS)
  const [location, setLocation] = useState(currentUser?.location || { lat: 28.6139, lng: 77.209 })
  const [preview, setPreview] = useState('')
  const [photo, setPhoto] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [declarationOpen, setDeclarationOpen] = useState(false)
  const objectUrlRef = useRef('')

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const safetyHint = useMemo(
    () => getSafetyHint(form.category, form.storage),
    [form.category, form.storage],
  )

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
    if (!navigator.geolocation) {
      addToast('Location is not available in this browser. Tap the map instead.', 'error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(next)
        setErrors((prev) => ({ ...prev, location: '' }))
        addToast('Current location added. Drag/click the map to adjust.', 'success')
      },
      () => addToast('Could not read your location. Tap the map to set it.', 'error'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const validate = () => {
    const next = {}
    if (!form.foodName.trim()) next.foodName = 'Give the food a clear name.'
    if (!form.quantity || Number(form.quantity) <= 0) next.quantity = 'Enter the number of servings.'
    if (!form.cookedAt) next.cookedAt = 'When was the food prepared?'
    if (!form.deadline) next.deadline = 'Set a pickup deadline.'
    if (form.cookedAt && form.deadline && new Date(form.deadline) <= new Date(form.cookedAt)) {
      next.deadline = 'Pickup deadline must be after the food was cooked.'
    }
    if (form.deadline && new Date(form.deadline).getTime() <= Date.now()) {
      next.deadline = 'Pickup deadline must be in the future.'
    }
    if (!form.address.trim()) next.address = 'Add a pickup address or landmark.'
    if (!form.contactPhone.trim() || form.contactPhone.replace(/\D/g, '').length < 10) {
      next.contactPhone = 'Enter a phone number with at least 10 digits.'
    }
    if (!location) next.location = 'Pick a pickup point on the map.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openDeclaration = (e) => {
    e.preventDefault()
    if (validate()) setDeclarationOpen(true)
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
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Add donation</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            List surplus food
          </h1>
          <p className="mt-2 text-slate-600">
            Accurate details help NGOs decide quickly. You will confirm the donation
            declaration before publishing.
          </p>
        </div>

        <form onSubmit={openDeclaration} className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]" noValidate>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <section>
              <h2 className="text-base font-bold text-slate-900">What are you sharing?</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field id="food-name" label="Food name" value={form.foodName} onChange={set('foodName')} error={errors.foodName} placeholder="Veg biryani, sandwiches, fruit boxes…" required />
                <Field as="select" id="food-category" label="Category" value={form.category} onChange={set('category')} required>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Field>
                <div>
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Diet <span className="text-red-600">*</span></span>
                  <div className="flex gap-2">
                    {[{ v: 'veg', l: 'Veg' }, { v: 'non-veg', l: 'Non-veg' }].map((d) => (
                      <label key={d.v} className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${form.diet === d.v ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="radio" name="diet" value={d.v} checked={form.diet === d.v} onChange={set('diet')} className="sr-only" />
                        {d.l}
                      </label>
                    ))}
                  </div>
                </div>
                <Field id="food-quantity" label="Quantity (servings)" type="number" min="1" value={form.quantity} onChange={set('quantity')} error={errors.quantity} placeholder="80" required />
              </div>
            </section>

            <section className="border-t border-slate-100 pt-5">
              <h2 className="text-base font-bold text-slate-900">Handling &amp; pickup window</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field id="food-cooked" label="Cooked / packed at" type="datetime-local" value={form.cookedAt} onChange={set('cookedAt')} error={errors.cookedAt} required />
                <div>
                  <Field as="select" id="food-storage" label="Storage condition" value={form.storage} onChange={set('storage')} required>
                    {STORAGE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Field>
                </div>
                <Field id="food-deadline" label="Pickup deadline" type="datetime-local" value={form.deadline} onChange={set('deadline')} error={errors.deadline} required />
                <Field id="food-phone" label="Contact phone" type="tel" value={form.contactPhone} onChange={set('contactPhone')} error={errors.contactPhone} placeholder="+91 98765 43210" required />
              </div>
              <p className="mt-3 rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs leading-relaxed text-warning-900 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-100">
                <Clock className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {safetyHint}
              </p>
            </section>

            <section className="border-t border-slate-100 pt-5">
              <h2 className="text-base font-bold text-slate-900">Pickup point</h2>
              <div className="mt-3">
                <Field id="food-address" label="Address / landmark" value={form.address} onChange={set('address')} error={errors.address} placeholder="12, Connaught Place, New Delhi" required />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" icon={MapPin} onClick={useCurrentLocation}>
                  Use my current location
                </Button>
                <span className="text-xs text-ink-muted">or tap the map to place the pin</span>
              </div>
              <div className="mt-3">
                <MapView
                  center={[location?.lat || 28.6139, location?.lng || 77.209]}
                  zoom={13}
                  height="240px"
                  onMapClick={(next) => {
                    setLocation(next)
                    setErrors((prev) => ({ ...prev, location: '' }))
                  }}
                  markers={location ? [{ id: 'pickup', lat: location.lat, lng: location.lng, color: '#059669', title: 'Pickup point', popup: <p className="text-xs font-semibold text-slate-800">Pickup point</p> }] : []}
                />
                {errors.location && <p className="mt-1 text-xs font-medium text-red-600">{errors.location}</p>}
                <p className="mt-1 text-xs text-slate-500">
                  Selected: {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                </p>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-5">
              <h2 className="text-base font-bold text-slate-900">Photo &amp; notes</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_1fr]">
                <div>
                  <label htmlFor="food-photo" className="mb-1 block text-sm font-semibold text-slate-700">Food photo <span className="font-normal text-slate-400">(optional)</span></label>
                  <label htmlFor="food-photo" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-emerald-400 hover:bg-emerald-50/40">
                    {preview ? (
                      <img src={preview} alt="Selected food preview" className="h-32 w-full rounded-lg object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6 text-slate-400" />
                        <span className="mt-2 text-sm font-semibold text-slate-700">Upload a photo</span>
                        <span className="mt-0.5 text-xs text-slate-500">JPG or PNG, shown to NGOs</span>
                      </>
                    )}
                    <input id="food-photo" type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
                  </label>
                  {photoBusy && <p className="mt-1 text-xs text-slate-500">Preparing preview…</p>}
                  {preview && (
                    <Button type="button" variant="ghostDanger" size="sm" icon={Trash2} onClick={clearPhoto} className="mt-2">
                      Remove photo
                    </Button>
                  )}
                </div>
                <Field as="textarea" id="food-notes" label="Notes for the NGO (optional)" rows={6} value={form.notes} onChange={set('notes')} placeholder="Packaging, allergens, entrance instructions…" />
              </div>
            </section>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-muted">You will confirm the Food Donation Declaration next.</p>
              <Button type="submit" variant="primary" size="lg" icon={Upload}>
                Review &amp; publish
              </Button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <UtensilsCrossed className="h-4 w-4 text-emerald-700" /> Listing preview
              </h2>
              <div className="mt-3 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-orange-50">
                {preview ? (
                  <img src={preview} alt="Food preview" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center text-emerald-700/50"><Camera className="h-9 w-9" /></div>
                )}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-900">{form.foodName || 'Your food name'}</p>
              <p className="text-xs text-slate-500">
                {categoryLabel(form.category)} · {form.diet === 'veg' ? 'Veg' : 'Non-veg'} · {storageLabel(form.storage)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{form.quantity || '0'} servings · {form.address || 'Pickup address'}</p>
              <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
                After publishing, the 3 nearest verified NGOs are alerted automatically.
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Future feature</p>
              <h3 className="mt-1 flex items-center gap-2 text-base font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-emerald-700" /> AI Food Safety Assistant
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Coming soon: photo-based freshness checks and handling prompts.
                This demo does not fake AI output.
              </p>
            </div>

            <p className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-500 ring-1 ring-slate-200">
              {URGENCY_DISCLAIMER} Never list food you would not serve to your own family.
            </p>
          </aside>
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
