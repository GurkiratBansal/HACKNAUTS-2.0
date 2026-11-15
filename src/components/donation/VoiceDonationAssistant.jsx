// FRESH:FILE  Interactive speech-to-text and voice assistant for hands-free food donation setup.
// FRESH:AREA  Donations

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  X,
} from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { toLocalDateTimeInput } from '../../utils/format'

const QUESTIONS = [
  {
    key: 'foodName',
    title: 'Food Name',
    prompt: 'What food would you like to donate?',
    help: 'e.g. Vegetable Biryani, Dal Rice, or 50 chapatis',
    parse: (text) => {
      // Clean up common filler words
      const cleaned = text
        .replace(/^(it is|it's|we have|i have|there is|donating|some)\s+/i, '')
        .trim()
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    },
  },
  {
    key: 'quantity',
    title: 'Quantity / Plates',
    prompt: 'How many plates or servings do you have?',
    help: 'e.g. 50 plates, 100 servings, or 25 packs',
    parse: (text) => {
      // Word to number conversion for common counts
      const wordMap = {
        one: 1, two: 2, three: 3, four: 4, five: 5,
        six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
        twenty: 20, thirty: 30, forty: 40, fifty: 50,
        hundred: 100, 'two hundred': 200, 'five hundred': 500, thousand: 1000,
      }
      const lower = text.toLowerCase()
      for (const [word, num] of Object.entries(wordMap)) {
        if (lower.includes(word)) return String(num)
      }
      const match = text.match(/\d+/)
      return match ? match[0] : ''
    },
  },
  {
    key: 'cookedAt',
    title: 'Time Cooked',
    prompt: 'When was the food cooked? For example: just now, or 1 hour ago.',
    help: 'e.g. just now, 1 hour ago, or 2 hours ago',
    parse: (text) => {
      const now = new Date()
      const lower = text.toLowerCase()
      if (lower.includes('just now') || lower.includes('fresh') || lower.includes('now')) {
        return toLocalDateTimeInput(now)
      }
      const hrMatch = lower.match(/(\d+)\s*hour/i)
      if (hrMatch) {
        const hrs = parseInt(hrMatch[1], 10)
        return toLocalDateTimeInput(new Date(now.getTime() - hrs * 60 * 60 * 1000))
      }
      const minMatch = lower.match(/(\d+)\s*minute/i)
      if (minMatch) {
        const mins = parseInt(minMatch[1], 10)
        return toLocalDateTimeInput(new Date(now.getTime() - mins * 60 * 1000))
      }
      return toLocalDateTimeInput(new Date(now.getTime() - 60 * 60 * 1000))
    },
  },
  {
    key: 'deadline',
    title: 'Expiry Timer',
    prompt: 'How many hours before it expires, or what is the expiry time?',
    help: 'e.g. 3 hours, 4 hours left, or tonight',
    parse: (text) => {
      const now = new Date()
      const lower = text.toLowerCase()
      const hrMatch = lower.match(/(\d+)\s*hour/i)
      if (hrMatch) {
        const hrs = parseInt(hrMatch[1], 10)
        return toLocalDateTimeInput(new Date(now.getTime() + hrs * 60 * 60 * 1000))
      }
      if (lower.includes('tonight')) {
        const tonight = new Date()
        tonight.setHours(22, 0, 0, 0)
        return toLocalDateTimeInput(tonight)
      }
      return toLocalDateTimeInput(new Date(now.getTime() + 3 * 60 * 60 * 1000))
    },
  },
  {
    key: 'address',
    title: 'Pickup Location',
    prompt: 'What is the pickup address or location?',
    help: 'e.g. Model Town Extension, Ludhiana or Community Center',
    parse: (text) => {
      return text.trim()
    },
  },
  {
    key: 'contactPhone',
    title: 'Contact Phone',
    prompt: 'What is your 10-digit Indian mobile number?',
    help: 'e.g. 9876543210',
    parse: (text) => {
      const digits = text.replace(/\D/g, '')
      if (digits.length === 10) return digits
      if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
      if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
      return digits || text
    },
  },
]

export default function VoiceDonationAssistant({ open, onClose, onApplyValues }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [recognitionError, setRecognitionError] = useState('')
  
  const recognitionRef = useRef(null)
  const currentQuestion = QUESTIONS[currentIdx]

  // Speak assistant prompts
  const speakText = useCallback((text, onFinish) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      onFinish?.()
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.lang = 'en-IN'
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => {
      setSpeaking(false)
      onFinish?.()
    }
    utterance.onerror = () => {
      setSpeaking(false)
      onFinish?.()
    }
    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  // Stop recognition and speaking when modal closes
  useEffect(() => {
    if (!open) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          void 0
        }
      }
      setListening(false)
      setSpeaking(false)
      setTranscript('')
      setRecognitionError('')
      setCurrentIdx(0)
    }
  }, [open])

  // Start speech recognition
  const startListening = useCallback(() => {
    setRecognitionError('')
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser. You can type in the field below.')
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN'

      recognition.onstart = () => {
        setListening(true)
        setTranscript('')
      }

      recognition.onresult = (event) => {
        let text = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript
        }
        setTranscript(text)
      }

      recognition.onerror = (event) => {
        setListening(false)
        if (event.error !== 'no-speech') {
          setRecognitionError(`Microphone notice: ${event.error}. You can also type below.`)
        }
      }

      recognition.onend = () => {
        setListening(false)
      }

      recognition.start()
    } catch {
      setListening(false)
      setRecognitionError('Microphone could not start. You can type below.')
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        void 0
      }
    }
    setListening(false)
  }, [])

  // When step changes and modal is open, speak the question then listen
  useEffect(() => {
    if (!open || !currentQuestion) return

    setTranscript(answers[currentQuestion.key] || '')
    setRecognitionError('')

    // Read question prompt
    speakText(currentQuestion.prompt, () => {
      // Auto-listen after question is spoken
      startListening()
    })

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [open, currentIdx, currentQuestion, answers, speakText, startListening])

  const handleSaveCurrentAndNext = () => {
    stopListening()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const raw = transcript.trim()
    if (raw && currentQuestion) {
      const parsed = currentQuestion.parse(raw)
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.key]: parsed || raw,
      }))
    }

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setTranscript('')
    } else {
      // Completed all questions
      handleFinish({
        ...answers,
        [currentQuestion.key]: currentQuestion.parse(raw) || raw,
      })
    }
  }

  const handleSkip = () => {
    stopListening()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setTranscript('')
    } else {
      handleFinish(answers)
    }
  }

  const handleFinish = (finalAnswers = answers) => {
    stopListening()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    onApplyValues(finalAnswers)
    onClose()
  }

  if (!open) return null

  const isLast = currentIdx === QUESTIONS.length - 1

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="voice-assistant-title"
      size="lg"
      closeLabel="Close voice assistant"
    >
      <div className="flex items-center justify-between border-b border-line p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft dark:bg-brand-500">
            <Mic className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="voice-assistant-title" className="font-display text-lg font-bold text-ink">
              Voice Donation Assistant
            </h2>
            <p className="text-xs text-ink-muted">
              Step {currentIdx + 1} of {QUESTIONS.length} &bull; Free speech-to-text setup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setVoiceEnabled((prev) => !prev)
              if (speaking && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel()
              }
            }}
            title={voiceEnabled ? 'Mute assistant audio' : 'Unmute assistant audio'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition hover:bg-tint hover:text-ink"
            aria-label={voiceEnabled ? 'Mute assistant audio' : 'Unmute assistant audio'}
          >
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-ink-muted" />
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {QUESTIONS.map((q, idx) => (
            <div
              key={q.key}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentIdx
                  ? 'bg-brand-600 dark:bg-brand-400'
                  : idx < currentIdx
                  ? 'bg-brand-200 dark:bg-brand-800'
                  : 'bg-tint'
              }`}
            />
          ))}
        </div>

        {/* Current Question Display */}
        <div className="rounded-2xl border border-line bg-elevated p-5 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            {currentQuestion.title}
          </span>
          <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
            {currentQuestion.prompt}
          </h3>
          <p className="text-xs text-ink-muted">
            {currentQuestion.help}
          </p>
        </div>

        {/* Live Audio / Recognition status */}
        <div className="flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all ${
              listening
                ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse dark:ring-rose-900/50'
                : speaking
                ? 'bg-amber-500 text-white ring-4 ring-amber-200 dark:ring-amber-900/50'
                : 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500'
            }`}
            aria-label={listening ? 'Stop listening' : 'Start listening'}
          >
            {listening ? (
              <Mic className="h-7 w-7" />
            ) : speaking ? (
              <Volume2 className="h-7 w-7 animate-bounce" />
            ) : (
              <Mic className="h-7 w-7" />
            )}
          </button>

          <p className="text-xs font-medium text-ink-soft">
            {listening
              ? 'Listening... Speak your answer now'
              : speaking
              ? 'Assistant is asking...'
              : 'Tap microphone to speak'}
          </p>
        </div>

        {/* Transcript / Input text */}
        <div className="space-y-1.5">
          <label htmlFor="voice-transcript" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Recognized Speech / Your Answer
          </label>
          <div className="relative">
            <input
              id="voice-transcript"
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="What you say will appear here (or type manually)..."
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {recognitionError && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {recognitionError}
            </p>
          )}
        </div>

        {/* Collected summary so far */}
        {Object.keys(answers).length > 0 && (
          <div className="rounded-xl border border-line bg-tint/40 p-3 space-y-1.5 text-xs">
            <p className="font-semibold text-ink-soft">Captured details:</p>
            <div className="grid grid-cols-2 gap-2 text-ink-muted">
              {answers.foodName && <div><span className="font-medium text-ink">Food:</span> {answers.foodName}</div>}
              {answers.quantity && <div><span className="font-medium text-ink">Plates:</span> {answers.quantity}</div>}
              {answers.address && <div><span className="font-medium text-ink">Location:</span> {answers.address}</div>}
              {answers.contactPhone && <div><span className="font-medium text-ink">Phone:</span> {answers.contactPhone}</div>}
            </div>
          </div>
        )}

        {/* Modal actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
            >
              Skip
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => speakText(currentQuestion.prompt, startListening)}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Repeat
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveCurrentAndNext}
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Finish &amp; Fill Form
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
