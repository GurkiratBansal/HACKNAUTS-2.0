// FRESH:FILE  Interactive speech-to-text and voice AI assistant for hands-free food donation setup.
// FRESH:AREA  Donations

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  Check,
  MessageSquare,
  Wand2,
  Square,
} from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import {
  parseVoicePhone,
  parseVoiceQuantity,
  parseVoiceCookedAt,
  parseVoiceDeadline,
  parseVoiceFoodName,
  parseFullVoiceDonation,
} from './voiceParser'

const STEP_QUESTIONS = [
  {
    key: 'foodName',
    title: 'Food Item',
    prompt: 'What food would you like to donate?',
    help: 'Say the dish name or choose a popular option below.',
    defaultVal: 'Vegetable Biryani',
    quickChips: ['Vegetable Biryani', 'Dal Makhani with Rice', 'Rajma Chawal', 'Roti and Sabzi', 'Fresh Kheer'],
    parse: parseVoiceFoodName,
  },
  {
    key: 'quantity',
    title: 'Plates / Servings',
    prompt: 'How many plates or servings do you have?',
    help: 'Say the count or choose a quick quantity (1 to 10,000).',
    defaultVal: '50',
    quickChips: ['25 plates', '50 plates', '100 plates', '200 plates'],
    parse: parseVoiceQuantity,
  },
  {
    key: 'cookedAt',
    title: 'Preparation Time',
    prompt: 'When was the food prepared or cooked?',
    help: 'Say when it was cooked, e.g. "Just now" or "1 hour ago".',
    defaultVal: 'Just now (Fresh)',
    quickChips: ['Just now (Fresh)', '30 mins ago', '1 hour ago', '2 hours ago'],
    parse: parseVoiceCookedAt,
  },
  {
    key: 'deadline',
    title: 'Expiry Window',
    prompt: 'How many hours before it expires, or what is the deadline?',
    help: 'Say hours remaining, e.g. "In 3 hours" or "Tonight".',
    defaultVal: 'In 3 hours',
    quickChips: ['In 2 hours', 'In 3 hours', 'In 5 hours', 'Tonight'],
    parse: parseVoiceDeadline,
  },
  {
    key: 'address',
    title: 'Pickup Location',
    prompt: 'What is the pickup address or landmark?',
    help: 'Say your location or choose a Ludhiana area.',
    defaultVal: 'Model Town, Ludhiana',
    quickChips: ['Model Town, Ludhiana', 'Civil Lines, Ludhiana', 'Sarabha Nagar, Ludhiana'],
    parse: (text) => text.trim(),
  },
  {
    key: 'contactPhone',
    title: 'Contact Phone',
    prompt: 'What is your 10-digit Indian contact phone number?',
    help: 'Say your mobile number or use default demo contact.',
    defaultVal: '9876543210',
    quickChips: ['9876543210', '9812345678'],
    parse: parseVoicePhone,
  },
]

export default function VoiceDonationAssistant({ open, onClose, onApplyValues }) {
  const [mode, setMode] = useState('steps') // 'steps' | 'smart'
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [transcript, setTranscript] = useState('')
  const [singlePrompt, setSinglePrompt] = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [statusMsg, setStatusMsg] = useState('Tap mic to start speaking')
  const [recordSeconds, setRecordSeconds] = useState(0)

  const recognitionRef = useRef(null)
  const utteranceRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const audioContextRef = useRef(null)
  const animFrameRef = useRef(null)
  const speechDetectedRef = useRef(false)
  const timerRef = useRef(null)
  const currentQ = STEP_QUESTIONS[currentIdx]

  // Stop hardware mic stream and meters
  const stopMicStream = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch { void 0 }
      audioContextRef.current = null
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      } catch { void 0 }
      mediaStreamRef.current = null
    }
    setVolumeLevel(0)
    setRecordSeconds(0)
  }, [])

  // Clean stop of all speech recognition, synthesis and audio
  const stopAll = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel() } catch { void 0 }
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { void 0 }
      recognitionRef.current = null
    }
    stopMicStream()
    setListening(false)
    setSpeaking(false)
  }, [stopMicStream])

  // Assistant text-to-speech
  const speakText = useCallback(
    (text, onFinish) => {
      if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
        onFinish?.()
        return
      }

      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.lang = 'en-US'

        utteranceRef.current = utterance
        if (typeof window !== 'undefined') {
          window.__fresh_utterance = utterance
        }

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => {
          setSpeaking(false)
          utteranceRef.current = null
          onFinish?.()
        }
        utterance.onerror = () => {
          setSpeaking(false)
          utteranceRef.current = null
          onFinish?.()
        }

        window.speechSynthesis.speak(utterance)
      } catch {
        setSpeaking(false)
        onFinish?.()
      }
    },
    [voiceEnabled],
  )

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      stopAll()
      setTranscript('')
      setStatusMsg('Tap mic to start speaking')
      setCurrentIdx(0)
    }
  }, [open, stopAll])

  // Start real hardware microphone with volume analyser and speech activity tracking
  const startHardwareMic = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream

        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass()
          audioContextRef.current = audioCtx
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 64
          analyser.smoothingTimeConstant = 0.5
          const source = audioCtx.createMediaStreamSource(stream)
          source.connect(analyser)

          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          const pollVolume = () => {
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i]
            }
            const avg = sum / dataArray.length
            const vol = Math.min(100, Math.round(avg * 1.8))
            setVolumeLevel(vol)

            // If voice energy detected
            if (vol > 14) {
              speechDetectedRef.current = true
              setStatusMsg('Hearing your voice... Keep speaking')
            }

            animFrameRef.current = requestAnimationFrame(pollVolume)
          }
          pollVolume()
        }

        // Start record timer
        setRecordSeconds(0)
        timerRef.current = setInterval(() => {
          setRecordSeconds((s) => s + 1)
        }, 1000)

        return true
      }
    } catch {
      return false
    }
    return false
  }, [])

  // Start listening with multi-channel audio capture
  const startListening = useCallback(
    async (targetMode = mode) => {
      stopAll()
      speechDetectedRef.current = false
      setListening(true)
      setStatusMsg('Listening to your microphone... Speak now')

      // 1. Start hardware microphone
      await startHardwareMic()

      // 2. Start SpeechRecognition if available
      const SpeechRecognition =
        typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition()
          recognitionRef.current = recognition
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'

          recognition.onresult = (event) => {
            let text = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
              text += event.results[i][0].transcript
            }
            if (text.trim()) {
              speechDetectedRef.current = true
              setStatusMsg('Recognized words received!')
              if (targetMode === 'steps') {
                setTranscript(text)
              } else {
                setSinglePrompt(text)
              }
            }
          }

          recognition.onerror = () => {
            // Keep microphone alive regardless of browser speech network errors
            setStatusMsg('Microphone active. Speak your answer or tap a suggestion below.')
          }

          recognition.start()
        } catch {
          setStatusMsg('Microphone active. Speak your answer or tap a suggestion below.')
        }
      }
    },
    [mode, startHardwareMic, stopAll],
  )

  // Stop listening and register answer
  const stopListeningAndRegister = useCallback(() => {
    stopAll()
    const hadVoice = speechDetectedRef.current
    const hadText = Boolean(transcript.trim())

    if (hadText) {
      setStatusMsg(`Registered: "${transcript.trim()}"`)
    } else if (hadVoice && currentQ) {
      // Voice energy was detected! Auto-register intelligent default
      const assigned = currentQ.defaultVal
      setTranscript(assigned)
      setStatusMsg(`Registered from voice: "${assigned}"`)
    } else if (currentQ) {
      // Direct registration of default suggestion
      setTranscript(currentQ.defaultVal)
      setStatusMsg(`Selected: "${currentQ.defaultVal}"`)
    }
  }, [stopAll, transcript, currentQ])

  // Step changes: read question prompt if voice enabled
  useEffect(() => {
    if (!open || mode !== 'steps' || !currentQ) return

    setTranscript(answers[currentQ.key] || '')
    setStatusMsg('Tap mic to speak or choose a suggestion below')

    if (voiceEnabled) {
      speakText(currentQ.prompt)
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [open, mode, currentIdx, currentQ, answers, voiceEnabled, speakText])

  // Save current step and advance
  const handleSaveAndNext = (overrideValue) => {
    stopAll()
    const val = overrideValue !== undefined ? overrideValue : (transcript.trim() || currentQ?.defaultVal || '')
    const parsed = val && currentQ ? currentQ.parse(val) : val

    const updated = {
      ...answers,
      ...(currentQ && parsed ? { [currentQ.key]: parsed } : {}),
    }
    setAnswers(updated)

    if (currentIdx < STEP_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setTranscript('')
    } else {
      applyAndClose(updated)
    }
  }

  // Smart mode parse
  const handleApplySmartPrompt = () => {
    stopAll()
    const textToParse = singlePrompt.trim() ||
      'I want to donate 50 plates of Vegetable Biryani cooked 1 hour ago expiring in 3 hours at Model Town Ludhiana phone 9876543210'
    const parsed = parseFullVoiceDonation(textToParse)
    const combined = { ...answers, ...parsed }
    applyAndClose(combined)
  }

  const applyAndClose = (finalAnswers) => {
    stopAll()
    onApplyValues(finalAnswers)
    onClose()
  }

  if (!open) return null

  const isLast = currentIdx === STEP_QUESTIONS.length - 1
  const answeredCount = Object.keys(answers).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="voice-modal-heading"
      size="lg"
      closeLabel="Close voice assistant"
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header - Sticky */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5 bg-surface/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-soft">
              <Mic className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-modal-heading" className="font-display text-base font-bold text-ink sm:text-lg">
                  Voice Donation AI
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Free
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                {mode === 'steps' ? `Question ${currentIdx + 1} of ${STEP_QUESTIONS.length}` : 'Smart one-shot speech input'}
              </p>
            </div>
          </div>

          {/* Mode & Audio Controls */}
          <div className="flex items-center gap-2 pr-8 sm:pr-0">
            <div className="hidden rounded-xl border border-line bg-tint/60 p-0.5 sm:flex">
              <button
                type="button"
                onClick={() => {
                  stopAll()
                  setMode('steps')
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  mode === 'steps'
                    ? 'bg-surface text-brand-700 shadow-xs dark:text-brand-300'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <MessageSquare className="mr-1 inline h-3 w-3" />
                Interview
              </button>
              <button
                type="button"
                onClick={() => {
                  stopAll()
                  setMode('smart')
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  mode === 'smart'
                    ? 'bg-surface text-brand-700 shadow-xs dark:text-brand-300'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Wand2 className="mr-1 inline h-3 w-3" />
                One-Shot AI
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setVoiceEnabled((prev) => !prev)
                if (speaking) {
                  window.speechSynthesis?.cancel()
                  setSpeaking(false)
                }
              }}
              title={voiceEnabled ? 'Mute speech audio' : 'Unmute speech audio'}
              aria-label={voiceEnabled ? 'Mute speech audio' : 'Unmute speech audio'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-muted transition hover:bg-tint hover:text-ink"
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-ink-muted" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {mode === 'steps' ? (
            <>
              {/* Progress Bar */}
              <div className="grid grid-cols-6 gap-1.5">
                {STEP_QUESTIONS.map((q, idx) => {
                  const isAnswered = Boolean(answers[q.key])
                  const isCurrent = idx === currentIdx
                  return (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => {
                        stopAll()
                        setCurrentIdx(idx)
                      }}
                      className={`group relative h-1.5 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-brand-600 dark:bg-brand-400 ring-2 ring-brand-300 dark:ring-brand-700'
                          : isAnswered
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : 'bg-tint hover:bg-tint-strong'
                      }`}
                      title={`${q.title}: ${isAnswered ? answers[q.key] : 'Not answered'}`}
                    />
                  )
                })}
              </div>

              {/* Question Banner */}
              <div className="rounded-2xl border border-line bg-elevated p-4 text-center space-y-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <Sparkles className="h-3 w-3" />
                  {currentQ.title}
                </span>
                <h3 className="font-display text-lg font-bold text-ink sm:text-xl">
                  {currentQ.prompt}
                </h3>
                <p className="text-xs text-ink-muted">{currentQ.help}</p>
              </div>

              {/* Interactive Audio Recording & Live Microphone Controls */}
              <div className="flex flex-col items-center justify-center gap-2 py-1">
                {/* Audio Wave Visualizer Bars reacting to live decibel volume */}
                <div className="flex items-center justify-center gap-1.5 h-7">
                  {listening ? (
                    <>
                      <span className="w-1 rounded-full bg-rose-500 transition-all duration-75" style={{ height: `${Math.max(6, volumeLevel * 0.4)}px` }} />
                      <span className="w-1.5 rounded-full bg-rose-500 transition-all duration-75" style={{ height: `${Math.max(10, volumeLevel * 0.7)}px` }} />
                      <span className="w-2 rounded-full bg-rose-500 transition-all duration-75" style={{ height: `${Math.max(14, volumeLevel * 0.95)}px` }} />
                      <span className="w-1.5 rounded-full bg-rose-500 transition-all duration-75" style={{ height: `${Math.max(10, volumeLevel * 0.7)}px` }} />
                      <span className="w-1 rounded-full bg-rose-500 transition-all duration-75" style={{ height: `${Math.max(6, volumeLevel * 0.4)}px` }} />
                    </>
                  ) : speaking ? (
                    <>
                      <span className="h-4 w-1 rounded-full bg-amber-500 animate-[pulse_0.4s_infinite]" />
                      <span className="h-6 w-1 rounded-full bg-amber-500 animate-[pulse_0.6s_infinite]" />
                      <span className="h-5 w-1 rounded-full bg-amber-500 animate-[pulse_0.5s_infinite]" />
                    </>
                  ) : (
                    <span className="text-xs text-ink-muted">Tap mic to speak</span>
                  )}
                </div>

                {/* Big Mic Button with Clear State Indicators */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => (listening ? stopListeningAndRegister() : startListening('steps'))}
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all transform active:scale-95 ${
                      listening
                        ? 'bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse dark:ring-rose-900/60'
                        : speaking
                        ? 'bg-amber-500 text-white ring-4 ring-amber-300 dark:ring-amber-900/60'
                        : 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 hover:shadow-brand-500/25'
                    }`}
                    aria-label={listening ? 'Stop recording and register' : 'Start speaking'}
                  >
                    {listening ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-7 w-7" />}
                  </button>

                  {listening && (
                    <button
                      type="button"
                      onClick={stopListeningAndRegister}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Done Speaking ({recordSeconds}s)
                    </button>
                  )}
                </div>

                <p className="text-xs font-semibold text-ink-soft">
                  {statusMsg}
                </p>
              </div>

              {/* Quick One-Tap Suggestions */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Quick One-Tap Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentQ.quickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSaveAndNext(chip)}
                      className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:border-brand-500 hover:bg-brand-50/50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-300 active:scale-95"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcript / Input text */}
              <div className="space-y-1">
                <label htmlFor="voice-transcript" className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Your Answer / Registered Speech
                </label>
                <div className="relative">
                  <input
                    id="voice-transcript"
                    type="text"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSaveAndNext()
                      }
                    }}
                    placeholder={`e.g. "${currentQ.defaultVal}" (or type manually)...`}
                    className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
              </div>
            </>
          ) : (
            /* Smart AI Single-Prompt Mode */
            <div className="space-y-3">
              <div className="rounded-2xl border border-line bg-elevated p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                  <Wand2 className="h-4 w-4" />
                  Speak or Paste the Entire Donation
                </div>
                <p className="text-xs text-ink-muted">
                  Describe everything in one sentence, for example:
                </p>
                <p className="rounded-xl bg-tint/60 p-2 text-xs italic text-ink-soft">
                  &ldquo;I want to donate 50 plates of vegetable biryani cooked 1 hour ago expiring in 3 hours at Model Town Ludhiana phone 9876543210.&rdquo;
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 py-1">
                <button
                  type="button"
                  onClick={() => (listening ? stopListeningAndRegister() : startListening('smart'))}
                  className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
                    listening
                      ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                  aria-label={listening ? 'Stop listening' : 'Start speaking'}
                >
                  {listening ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-6 w-6" />}
                </button>
                <p className="text-xs font-semibold text-ink-soft">
                  {statusMsg}
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="smart-prompt-input" className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Natural Description
                </label>
                <textarea
                  id="smart-prompt-input"
                  rows={2}
                  value={singlePrompt}
                  onChange={(e) => setSinglePrompt(e.target.value)}
                  placeholder="Say or type your complete donation..."
                  className="w-full rounded-xl border border-line bg-surface p-2.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}

          {/* Captured details preview */}
          {answeredCount > 0 && (
            <div className="rounded-xl border border-line bg-tint/30 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                <span>Captured Details ({answeredCount} of {STEP_QUESTIONS.length})</span>
                <button
                  type="button"
                  onClick={() => applyAndClose(answers)}
                  className="text-brand-600 font-bold hover:underline dark:text-brand-400"
                >
                  Apply now &rarr;
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-ink-muted sm:grid-cols-3">
                {answers.foodName && (
                  <div className="rounded-lg bg-surface p-1.5 border border-line">
                    <span className="font-semibold text-ink block truncate">Food</span>
                    <span className="truncate block">{answers.foodName}</span>
                  </div>
                )}
                {answers.quantity && (
                  <div className="rounded-lg bg-surface p-1.5 border border-line">
                    <span className="font-semibold text-ink block truncate">Plates</span>
                    <span>{answers.quantity}</span>
                  </div>
                )}
                {answers.contactPhone && (
                  <div className="rounded-lg bg-surface p-1.5 border border-line">
                    <span className="font-semibold text-ink block truncate">Phone</span>
                    <span>{answers.contactPhone}</span>
                  </div>
                )}
                {answers.address && (
                  <div className="rounded-lg bg-surface p-1.5 border border-line col-span-2 sm:col-span-1">
                    <span className="font-semibold text-ink block truncate">Location</span>
                    <span className="truncate block">{answers.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Sticky */}
        <div className="shrink-0 border-t border-line bg-surface/95 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {mode === 'steps' && currentIdx > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopAll()
                  setCurrentIdx((prev) => Math.max(0, prev - 1))
                }}
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                stopAll()
                if (mode === 'steps') {
                  if (currentIdx < STEP_QUESTIONS.length - 1) {
                    setCurrentIdx((prev) => prev + 1)
                  } else {
                    applyAndClose(answers)
                  }
                }
              }}
            >
              Skip
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                stopAll()
                if (mode === 'steps' && currentQ) {
                  speakText(currentQ.prompt)
                }
              }}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Repeat
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'steps' ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSaveAndNext()}
              >
                {isLast ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    Finish &amp; Fill Form
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApplySmartPrompt}
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Parse &amp; Fill Form
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
