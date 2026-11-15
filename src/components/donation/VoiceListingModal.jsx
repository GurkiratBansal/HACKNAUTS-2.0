// FRESH:FILE  Voice-to-Food Listing Modal with Multilingual STT, Conversational Interview (All Form Fields), and Online Expiry Research.
// FRESH:AREA  Voice AI & Donations

import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Globe2,
  HelpCircle,
  MapPin,
  Mic,
  MicOff,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import voiceService from '../../services/voiceService'
import aiExtractionService from '../../services/aiExtractionService'
import ttsService from '../../services/ttsService'

const LANGUAGES = [
  { code: 'auto', label: 'Auto Detect', flag: '🌐', tts: 'en-IN' },
  { code: 'en', label: 'English', flag: '🇬🇧', tts: 'en-IN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', tts: 'hi-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🌾', tts: 'pa-IN' },
]

export const INTERVIEW_QUESTIONS = [
  {
    key: 'foodName',
    title: '1. Food Dish Name',
    subtitle: 'Say the dish name, e.g. "Dal Makhani with Jeera Rice", "Vegetable Biryani", or "Paneer Butter Masala".',
    spokenPrompt: 'What food would you like to donate? Please say the dish name.',
    suggestions: ['Dal Makhani with Jeera Rice', 'Vegetable Biryani', 'Paneer Butter Masala', 'Rajma Chawal', 'Fresh Rotis and Sabzi', 'Fresh Rice Kheer'],
  },
  {
    key: 'diet',
    title: '2. Dietary Preference',
    subtitle: 'Is the food Vegetarian, Non-Vegetarian, or Jain?',
    spokenPrompt: 'Is this food Vegetarian, Non-Vegetarian, or Jain?',
    suggestions: ['Vegetarian (Veg)', 'Non-Vegetarian', 'Jain (No Onion/Garlic)', 'Vegan'],
  },
  {
    key: 'category',
    title: '3. Food Category',
    subtitle: 'What category is this: Cooked Meal, Bakery, Snacks, or Packaged Food?',
    spokenPrompt: 'What category is this food: Cooked Meal, Bakery, Snacks, or Packaged Food?',
    suggestions: ['Cooked Meals', 'Bakery & Bread', 'Snacks & Savories', 'Raw & Packaged Food'],
  },
  {
    key: 'quantity',
    title: '4. Quantity / Portions',
    subtitle: 'How many plates, servings, or kilograms do you have available?',
    spokenPrompt: 'How many plates, servings, or kilograms are available for donation?',
    suggestions: ['25 plates', '40 plates', '60 plates', '10 kg', '20 kg', '100 servings'],
  },
  {
    key: 'cookedAt',
    title: '5. Preparation / Cooking Time',
    subtitle: 'When was this food cooked or prepared?',
    spokenPrompt: 'When was this food prepared or cooked? For example, 1 hour ago or freshly cooked.',
    suggestions: ['Just cooked (Fresh)', '30 minutes ago', '1 hour ago', '2 hours ago', 'This morning at 10 AM'],
  },
  {
    key: 'storage',
    title: '6. Storage Condition',
    subtitle: 'How is the food currently stored: room temperature, hot holding, or refrigerated?',
    spokenPrompt: 'How is the food stored: room temperature, hot holding, or refrigerated?',
    suggestions: ['Room Temperature (25°C)', 'Hot Holding (>60°C)', 'Refrigerated (<4°C)'],
  },
  {
    key: 'expiryAnswer',
    title: '7. Safe Expiry & AI Research',
    subtitle: 'Do you have an expiry time, or should our AI research the safe consumption window?',
    spokenPrompt: 'Do you have an exact expiry time, or would you like our AI to research the safe consumption window for this dish?',
    suggestions: ['🔍 Research Expiry Automatically', 'Consume within 3 hours', 'Consume within 4 hours', 'Pick up before 8 PM'],
  },
  {
    key: 'address',
    title: '8. Pickup Address & Locality',
    subtitle: 'Where can NGOs collect the food? Say your street address or locality.',
    spokenPrompt: 'What is the pickup address or locality where NGOs can collect the food?',
    suggestions: ['Model Town, Ludhiana', 'Civil Lines, Ludhiana', 'Mall Road, Ludhiana', 'Sector 32, Ludhiana', 'Sarabha Nagar, Ludhiana'],
  },
  {
    key: 'contactPhone',
    title: '9. Donor Contact Phone',
    subtitle: 'Say your 10-digit mobile number for pickup coordination.',
    spokenPrompt: 'What is your 10-digit mobile phone number for pickup coordination?',
    suggestions: ['9876543210', '9814012345', '9872098765', 'Type Phone Manually'],
  },
  {
    key: 'notes',
    title: '10. Special Notes & Instructions',
    subtitle: 'Any packaging details, utensils needed, or gate instructions?',
    spokenPrompt: 'Are there any special handling notes, packaging requirements, or gate instructions?',
    suggestions: ['Bring insulated carry boxes', 'Packed in disposable foil containers', 'Gate 2 pickup, parking available', 'No special notes'],
  },
]

export function normalizeSpokenPhone(text) {
  if (!text) return ''
  const wordMap = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  }
  let str = text.toLowerCase()
  str = str.replace(/double\s+(\w+)/g, '$1 $1')
  str = str.replace(/triple\s+(\w+)/g, '$1 $1 $1')
  Object.entries(wordMap).forEach(([word, digit]) => {
    str = str.replace(new RegExp(`\\b${word}\\b`, 'g'), digit)
  })
  const digits = str.replace(/\D/g, '')
  if (digits.length >= 10) {
    const match = digits.match(/[6-9]\d{9}/)
    if (match) return match[0]
    return digits.slice(-10)
  }
  return text.replace(/[^\d+]/g, '') || text
}

export default function VoiceListingModal({
  open,
  onClose,
  onApplyExtractedData,
  currentForm = {},
  apiBaseUrl = '/api/v1',
}) {
  const [mode, setMode] = useState('interview')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [language, setLanguage] = useState('auto')
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [liveCaption, setLiveCaption] = useState('')

  // 10 form fields
  const [answers, setAnswers] = useState({
    foodName: currentForm?.foodName || '',
    diet: currentForm?.diet || 'veg',
    category: currentForm?.category || 'cooked',
    quantity: currentForm?.quantity || '',
    cookedAt: '1 hour ago',
    storage: currentForm?.storage || 'room',
    expiryAnswer: '',
    address: currentForm?.address || '',
    contactPhone: currentForm?.contactPhone || '',
    notes: currentForm?.notes || '',
  })

  const [oneShotTranscript, setOneShotTranscript] = useState('')
  const [extractedData, setExtractedData] = useState(null)
  const [researchData, setResearchData] = useState(null)
  const [isSpeakingResearch, setIsSpeakingResearch] = useState(false)
  const [isResearching, setIsResearching] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)
  const speechRecognitionRef = useRef(null)
  const liveTranscriptRef = useRef('')

  useEffect(() => {
    return () => {
      cleanupAudio()
      ttsService.stop()
    }
  }, [])

  useEffect(() => {
    if (open) {
      setMode('interview')
      setQuestionIndex(0)
      setStatus('idle')
      setErrorMessage('')
      setLiveCaption('')
      setOneShotTranscript('')
      setExtractedData(null)
      setResearchData(null)
      setAnswers({
        foodName: currentForm?.foodName || '',
        diet: currentForm?.diet || 'veg',
        category: currentForm?.category || 'cooked',
        quantity: currentForm?.quantity || '',
        cookedAt: '1 hour ago',
        storage: currentForm?.storage || 'room',
        expiryAnswer: '',
        address: currentForm?.address || '',
        contactPhone: currentForm?.contactPhone || '',
        notes: currentForm?.notes || '',
      })

      if (!voiceMuted) {
        speakCurrentQuestion(0)
      }
    } else {
      cleanupAudio()
      ttsService.stop()
    }
  }, [open])

  const cleanupAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch {}
      speechRecognitionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsRecording(false)
  }

  const speakPrompt = (text) => {
    if (voiceMuted || !text) return
    const langObj = LANGUAGES.find((l) => l.code === language)
    const ttsLang = langObj ? langObj.tts : 'en-IN'
    ttsService.speak(text, { lang: ttsLang, rate: 1.0 })
  }

  const speakCurrentQuestion = (idx = questionIndex) => {
    const q = INTERVIEW_QUESTIONS[idx]
    if (q) {
      speakPrompt(q.spokenPrompt)
    }
  }

  const toggleMute = () => {
    if (!voiceMuted) {
      ttsService.stop()
      setVoiceMuted(true)
    } else {
      setVoiceMuted(false)
      speakCurrentQuestion()
    }
  }

  const startListening = async () => {
    try {
      setErrorMessage('')
      liveTranscriptRef.current = ''
      setLiveCaption('')
      audioChunksRef.current = []

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      let mimeType = 'audio/webm;codecs=opus'
      if (window.MediaRecorder && !MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        await handleAudioStopped(audioBlob)
      }

      let langTag = 'en-IN'
      if (language === 'hi') langTag = 'hi-IN'
      else if (language === 'pa') langTag = 'pa-IN'

      const recognition = voiceService.startLiveRecognition({
        language: langTag,
        onResult: (spokenText) => {
          liveTranscriptRef.current = spokenText
          setLiveCaption(spokenText)
        },
        onError: (err) => console.warn('Recognition error:', err),
      })
      speechRecognitionRef.current = recognition

      recorder.start(250)
      setIsRecording(true)
      setStatus('recording')
      setRecordSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 59) {
            stopListening()
            return 60
          }
          return s + 1
        })
      }, 1000)
    } catch (err) {
      setErrorMessage(err.message || 'Could not access microphone.')
      setStatus('error')
      cleanupAudio()
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    cleanupAudio()
  }

  const handleAudioStopped = async (audioBlob) => {
    let text = liveTranscriptRef.current?.trim() || ''

    if (!text && audioBlob.size > 0) {
      try {
        const res = await voiceService.transcribeAudio(audioBlob, language, `${apiBaseUrl}/voice/transcribe`)
        text = (res?.transcript || '').trim()
      } catch (err) {
        console.warn('Fallback audio transcription failed:', err)
      }
    }

    if (!text) {
      setErrorMessage('No speech detected. Please tap mic and speak again or pick a quick suggestion.')
      setStatus('idle')
      return
    }

    if (mode === 'interview') {
      handleAnswerSpoken(text)
    } else {
      setOneShotTranscript(text)
      runExtraction(text)
    }
  }

  const handleAnswerSpoken = (rawText) => {
    const currentQ = INTERVIEW_QUESTIONS[questionIndex]
    if (!currentQ) return

    let cleanVal = rawText.trim()

    // Normalize specific field types
    if (currentQ.key === 'diet') {
      const low = cleanVal.toLowerCase()
      if (low.includes('non') || low.includes('meat') || low.includes('chicken')) cleanVal = 'non-veg'
      else if (low.includes('jain') || low.includes('satvik')) cleanVal = 'jain'
      else cleanVal = 'veg'
    } else if (currentQ.key === 'category') {
      const low = cleanVal.toLowerCase()
      if (low.includes('bake') || low.includes('bread') || low.includes('cake')) cleanVal = 'bakery'
      else if (low.includes('snack') || low.includes('samosa') || low.includes('pakora')) cleanVal = 'snacks'
      else if (low.includes('raw') || low.includes('packaged') || low.includes('fruit')) cleanVal = 'raw_packaged'
      else cleanVal = 'cooked'
    } else if (currentQ.key === 'storage') {
      const low = cleanVal.toLowerCase()
      if (low.includes('hot') || low.includes('garam') || low.includes('warm')) cleanVal = 'hot'
      else if (low.includes('fridge') || low.includes('refrigerat') || low.includes('thanda') || low.includes('chilled')) cleanVal = 'refrigerated'
      else cleanVal = 'room'
    } else if (currentQ.key === 'contactPhone') {
      cleanVal = normalizeSpokenPhone(cleanVal)
    }

    const updatedAnswers = { ...answers, [currentQ.key]: cleanVal }
    setAnswers(updatedAnswers)

    if (questionIndex < INTERVIEW_QUESTIONS.length - 1) {
      const nextIdx = questionIndex + 1
      setQuestionIndex(nextIdx)
      setLiveCaption('')
      speakCurrentQuestion(nextIdx)
    } else {
      compileAndRunResearch(updatedAnswers)
    }
  }

  const compileAndRunResearch = async (data = answers) => {
    setIsResearching(true)
    setStatus('processing')
    setErrorMessage('')

    const combinedTranscript = `We want to donate ${data.quantity || '30 plates'} of ${data.diet || 'veg'} ${data.foodName || 'wholesome meals'} under category ${data.category || 'cooked'}. Prepared ${data.cookedAt || '1 hour ago'}, stored at ${data.storage || 'room'} temperature. Pickup at ${data.address || 'Model Town Ludhiana'}, phone ${data.contactPhone || '9876543210'}. Notes: ${data.notes || 'Handle with care'}. ${data.expiryAnswer || ''}`

    try {
      const extracted = await aiExtractionService.extractFood(
        {
          transcript: combinedTranscript,
          language,
          referenceTime: new Date().toISOString(),
        },
        `${apiBaseUrl}/ai-extraction/food`,
      )

      const research = await aiExtractionService.researchExpiry(
        {
          foodName: extracted.foodName || data.foodName,
          storage: data.storage || extracted.storage || 'room',
          category: data.category || extracted.category || 'cooked',
          diet: data.diet || extracted.diet || 'veg',
          cookedAt: extracted.cookedAt,
        },
        `${apiBaseUrl}/ai-extraction/research-expiry`,
      )

      setExtractedData({
        ...extracted,
        diet: data.diet || extracted.diet,
        category: data.category || extracted.category,
        storage: data.storage || extracted.storage,
        address: data.address || extracted.address || '',
        contactPhone: data.contactPhone || extracted.contactPhone || '',
        notes: data.notes || extracted.notes || '',
      })
      setResearchData(research)
      setStatus('researched')
      setIsResearching(false)

      if (!voiceMuted) {
        const spokenResearch = `I researched ${research.foodName}. Safe consumption limit is ${research.safeHoursTotal} hours from cooking. All 10 fields of your donation form are now fully populated!`
        speakPrompt(spokenResearch)
      }
    } catch (err) {
      setErrorMessage(err.message || 'AI research failed. You can apply manual details.')
      setStatus('idle')
      setIsResearching(false)
    }
  }

  const runExtraction = async (textToExtract = oneShotTranscript) => {
    if (!textToExtract.trim()) {
      setErrorMessage('Please provide spoken or typed donation details.')
      return
    }

    setIsResearching(true)
    setStatus('processing')
    setErrorMessage('')

    try {
      const result = await aiExtractionService.extractFood(
        {
          transcript: textToExtract.trim(),
          language,
          referenceTime: new Date().toISOString(),
        },
        `${apiBaseUrl}/ai-extraction/food`,
      )

      const research = await aiExtractionService.researchExpiry(
        {
          foodName: result.foodName,
          storage: result.storage,
          category: result.category,
          diet: result.diet,
          cookedAt: result.cookedAt,
        },
        `${apiBaseUrl}/ai-extraction/research-expiry`,
      )

      setExtractedData(result)
      setResearchData(research)
      setStatus('researched')
      setIsResearching(false)

      if (!voiceMuted) {
        speakPrompt(
          `Extracted ${result.quantity} ${result.quantityUnit} of ${result.diet} ${result.foodName}. Safe consumption timer set to ${research.safeRemainingHours} hours remaining. All details filled!`,
        )
      }
    } catch (err) {
      setErrorMessage(err.message || 'Extraction failed. Please try again.')
      setStatus('idle')
      setIsResearching(false)
    }
  }

  const handleReadAloudResearch = () => {
    if (isSpeakingResearch) {
      ttsService.stop()
      setIsSpeakingResearch(false)
      return
    }

    if (!researchData) return
    const text = `Food Safety Research: ${researchData.foodName} is classified as ${researchData.foodTypeLabel}. Under ${researchData.storageObserved} storage, ${researchData.scientificReason} Critical handling rule: ${researchData.criticalControlPoint}. Total safe window: ${researchData.safeHoursTotal} hours.`

    const langObj = LANGUAGES.find((l) => l.code === language)
    ttsService.speak(text, {
      lang: langObj ? langObj.tts : 'en-IN',
      rate: 1.0,
      onStart: () => setIsSpeakingResearch(true),
      onEnd: () => setIsSpeakingResearch(false),
      onError: () => setIsSpeakingResearch(false),
    })
  }

  const handleApplyToForm = () => {
    const finalData = extractedData || {}
    const finalResearch = researchData || {}

    const updates = {
      foodName: finalData.foodName || answers.foodName || 'Surplus Food',
      quantity: String(finalData.quantity || answers.quantity || '30'),
      category: answers.category || finalData.category || 'cooked',
      diet: answers.diet || finalData.diet || 'veg',
      storage: answers.storage || finalData.storage || 'room',
      cookedAt: finalData.cookedAt || finalResearch.calculatedCookedAt,
      deadline: finalData.expiresAt || finalResearch.calculatedExpiresAt,
      address: answers.address || finalData.address || '',
      contactPhone: answers.contactPhone || finalData.contactPhone || '',
      notes: [
        answers.notes,
        finalResearch.scientificReason ? `[AI Safety]: ${finalResearch.scientificReason} (${finalResearch.authorityStandards})` : '',
      ].filter(Boolean).join(' | '),
    }

    if (onApplyExtractedData) {
      onApplyExtractedData(updates, { ...finalData, research: finalResearch })
    }
    onClose()
  }

  if (!open) return null

  const currentQ = INTERVIEW_QUESTIONS[questionIndex]

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Voice Donation AI
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  Full Form AI
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Fills every single detail of the donation form purely via natural voice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              title={voiceMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
            >
              {voiceMuted ? <VolumeX className="h-5 w-5 text-gray-400" /> : <Volume2 className="h-5 w-5 text-emerald-600" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector & Language */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => {
                setMode('interview')
                setStatus('idle')
                speakCurrentQuestion(questionIndex)
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                mode === 'interview'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-gray-700 dark:text-emerald-300'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              💬 Complete 10-Step Interview
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('oneshot')
                setStatus('idle')
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                mode === 'oneshot'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-gray-700 dark:text-emerald-300'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ⚡ One-Shot Spoken Sentence
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Globe2 className="h-3.5 w-3.5 text-emerald-600" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GUIDED INTERVIEW MODE */}
        {mode === 'interview' && status !== 'researched' && (
          <div className="mt-5 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>Question {questionIndex + 1} of {INTERVIEW_QUESTIONS.length}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {Math.round(((questionIndex + 1) / INTERVIEW_QUESTIONS.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${((questionIndex + 1) / INTERVIEW_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active Question Box */}
            <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 text-center dark:border-gray-800 dark:bg-gray-800/30">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {currentQ.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
                {currentQ.subtitle}
              </p>

              {/* Mic Action Button */}
              <div className="mt-6 flex flex-col items-center">
                {isRecording ? (
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
                    <button
                      type="button"
                      onClick={stopListening}
                      className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl hover:bg-rose-700 transition"
                    >
                      <MicOff className="h-8 w-8" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startListening}
                    className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 hover:scale-105 transition"
                  >
                    <Mic className="h-8 w-8 transition-transform group-hover:scale-110" />
                  </button>
                )}

                <p className="mt-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isRecording ? `Listening... ${recordSeconds}s (Tap to Finish)` : 'Tap Mic & Speak'}
                </p>

                {liveCaption && (
                  <div className="mt-3 w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3 text-left dark:border-emerald-800 dark:bg-emerald-950/40">
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      Spoken Transcript:
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white italic">
                      "{liveCaption}"
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Tap Suggestions */}
              <div className="mt-6 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Quick One-Tap Suggestions:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {currentQ.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAnswerSpoken(suggestion)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-xs hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual input for this field if desired */}
              <div className="mt-4 max-w-sm mx-auto">
                <input
                  type="text"
                  value={answers[currentQ.key] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentQ.key]: e.target.value })}
                  placeholder="Or type answer directly..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white text-center"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={questionIndex === 0}
                onClick={() => {
                  const prevIdx = Math.max(0, questionIndex - 1)
                  setQuestionIndex(prevIdx)
                  speakCurrentQuestion(prevIdx)
                }}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous Question
              </button>

              {questionIndex < INTERVIEW_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = questionIndex + 1
                    setQuestionIndex(nextIdx)
                    speakCurrentQuestion(nextIdx)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => compileAndRunResearch(answers)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  <Search className="h-4 w-4" />
                  <span>Research &amp; Fill Entire Form</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ONE-SHOT AI MODE */}
        {mode === 'oneshot' && status !== 'researched' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 text-center dark:border-gray-800 dark:bg-gray-800/30">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Describe everything in one sentence to fill the entire form:
              </p>
              <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto italic">
                "I want to donate 50 plates of veg biryani cooked 1 hour ago at Model Town Ludhiana phone 9876543210 keep hot."
              </p>

              <div className="mt-6 flex flex-col items-center">
                {isRecording ? (
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
                    <button
                      type="button"
                      onClick={stopListening}
                      className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl hover:bg-rose-700 transition"
                    >
                      <MicOff className="h-8 w-8" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startListening}
                    className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 hover:scale-105 transition"
                  >
                    <Mic className="h-8 w-8" />
                  </button>
                )}
                <p className="mt-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isRecording ? `Recording speech... (${recordSeconds}s)` : 'Tap Mic & Speak Full Description'}
                </p>
              </div>

              <div className="mt-5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Spoken Sentence:
                </label>
                <textarea
                  rows={3}
                  value={oneShotTranscript}
                  onChange={(e) => setOneShotTranscript(e.target.value)}
                  placeholder="Say or type your complete donation description..."
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => runExtraction(oneShotTranscript)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze &amp; Fill Entire Form</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING / RESEARCHING */}
        {isResearching && (
          <div className="mt-8 flex flex-col items-center justify-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
            <h4 className="mt-4 text-base font-black text-gray-900 dark:text-white">
              Food Safety AI is researching and populating form...
            </h4>
            <p className="mt-1 text-xs text-gray-500 max-w-sm text-center">
              FSSAI &amp; USDA scientific storage databases, calculating microbiological spore limits and accurate safe expiry timer...
            </p>
          </div>
        )}

        {/* COMPLETED RESULTS: ALL 10 FIELDS DISPLAYED */}
        {status === 'researched' && researchData && (
          <div className="mt-5 space-y-4">
            {/* Food Safety & Online Expiry Research Card */}
            <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white p-5 shadow-sm dark:border-emerald-800 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                      Food Safety &amp; Expiry Research Verdict
                    </h4>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400">
                      {researchData.authorityStandards}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReadAloudResearch}
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-700 dark:bg-gray-800 dark:text-emerald-300"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isSpeakingResearch ? 'Stop Speaking' : 'Read Aloud (TTS)'}</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200/80 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-800/70">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase">
                    <Clock className="h-3.5 w-3.5" /> Researched Safe Expiry
                  </span>
                  <p className="mt-1 text-base font-black text-gray-900 dark:text-white">
                    {new Date(researchData.calculatedExpiresAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {researchData.safeRemainingHours}h safe window remaining
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-800/70">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase">
                    <Thermometer className="h-3.5 w-3.5" /> Storage Mode
                  </span>
                  <p className="mt-1 text-base font-black text-gray-900 dark:text-white capitalize">
                    {researchData.storageObserved} Temp
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    Max {researchData.safeHoursTotal} hrs from cooking
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-800/70">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase">
                    <BookOpen className="h-3.5 w-3.5" /> Classification
                  </span>
                  <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white truncate">
                    {researchData.foodTypeLabel}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    FSSAI Schedule 4 Compliant
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/90 p-3.5 border border-emerald-100 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
                <p className="font-bold text-emerald-950 dark:text-emerald-200">
                  🔬 Scientific Safety Finding:
                </p>
                <p className="mt-1 leading-relaxed">
                  {researchData.scientificReason}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                  ⚠️ Critical Control Rule: {researchData.criticalControlPoint}
                </p>
              </div>
            </div>

            {/* Complete 10-Field Form Summary */}
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                All 10 Donation Form Fields Populated:
              </span>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">1. Dish</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate">{answers.foodName || extractedData?.foodName}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">2. Diet</p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">{answers.diet || extractedData?.diet}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">3. Category</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white capitalize">{answers.category || extractedData?.category}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">4. Quantity</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">
                    {extractedData?.quantity || answers.quantity} {extractedData?.quantityUnit || 'plates'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">5. Made Time</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                    {answers.cookedAt || '1 hour ago'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">6. Storage</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white capitalize">{answers.storage || 'room'} temp</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">7. Expiry Deadline</p>
                  <p className="text-xs font-black text-rose-600 dark:text-rose-400">
                    {new Date(researchData.calculatedExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">8. Phone</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">{answers.contactPhone || '9876543210'}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-gray-500">9. Pickup Address: </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{answers.address || 'Model Town, Ludhiana'}</span>
                </div>
              </div>

              {answers.notes && (
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs">
                  <span className="font-bold text-gray-500">10. Special Notes: </span>
                  <span className="text-gray-900 dark:text-white">{answers.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          {status === 'researched' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('idle')
                  setQuestionIndex(0)
                }}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Re-ask Questions
              </button>
              <button
                type="button"
                onClick={handleApplyToForm}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-lg hover:bg-emerald-700 transition"
              >
                <span>Apply &amp; Fill Entire Form</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => compileAndRunResearch(answers)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-700"
            >
              <span>Research Expiry &amp; Fill Form</span>
              <Sparkles className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
