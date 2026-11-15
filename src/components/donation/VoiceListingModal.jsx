import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe2,
  HelpCircle,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import voiceService from '../../services/voiceService';
import aiExtractionService from '../../services/aiExtractionService';
import ttsService from '../../services/ttsService';

const LANGUAGES = [
  { code: 'auto', label: 'Auto Detect', flag: '🌐', tts: 'en-IN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', tts: 'hi-IN' },
  { code: 'en', label: 'English', flag: '🇬🇧', tts: 'en-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🌾', tts: 'pa-IN' },
];

export default function VoiceListingModal({
  open,
  onClose,
  onApplyExtractedData,
  currentForm = {},
  apiBaseUrl = '/api/v1',
}) {
  const [status, setStatus] = useState('idle'); // idle | recording | transcribing | transcribed | extracting | extracted | error
  const [language, setLanguage] = useState('auto');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      ttsService.stop();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setStatus('idle');
      setTranscript('');
      setLiveInterim('');
      setExtractedData(null);
      setErrorMessage('');
      setRecordSeconds(0);
      liveTranscriptRef.current = '';
    } else {
      stopRecordingCleanup();
      ttsService.stop();
    }
  }, [open]);

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setErrorMessage('');
      audioChunksRef.current = [];
      liveTranscriptRef.current = '';
      setLiveInterim('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm;codecs=opus';
      if (window.MediaRecorder && !MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        await processAudio(audioBlob);
      };

      // Browser-native high-accuracy SpeechRecognition
      let langTag = 'en-IN';
      if (language === 'hi') langTag = 'hi-IN';
      else if (language === 'pa') langTag = 'pa-IN';
      else if (language === 'en') langTag = 'en-IN';

      const recognition = voiceService.startLiveRecognition({
        language: langTag,
        onResult: (spokenText) => {
          liveTranscriptRef.current = spokenText;
          setLiveInterim(spokenText);
        },
        onError: (err) => console.warn('Live recognition event:', err),
      });
      speechRecognitionRef.current = recognition;

      recorder.start(250);
      setStatus('recording');
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 119) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Could not access microphone.');
      setStatus('error');
      stopRecordingCleanup();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopRecordingCleanup();
  };

  const processAudio = async (audioBlob) => {
    try {
      setStatus('transcribing');
      let text = liveTranscriptRef.current?.trim() || '';

      if (!text) {
        const res = await voiceService.transcribeAudio(audioBlob, language, `${apiBaseUrl}/voice/transcribe`);
        text = (res?.transcript || '').trim();
      }

      if (!text) {
        throw new Error('No speech was detected in the recording. Please speak clearly and try again.');
      }

      setTranscript(text);
      setStatus('transcribed');

      await handleExtractFood(text);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to transcribe audio. Please try again.');
      setStatus('error');
    }
  };

  const handleExtractFood = async (textToExtract = transcript) => {
    if (!textToExtract.trim()) {
      setErrorMessage('Please provide speech or text to extract.');
      return;
    }

    try {
      setStatus('extracting');
      setErrorMessage('');

      const result = await aiExtractionService.extractFood(
        {
          transcript: textToExtract.trim(),
          language,
          referenceTime: new Date().toISOString(),
        },
        `${apiBaseUrl}/ai-extraction/food`
      );

      setExtractedData(result);
      setStatus('extracted');
    } catch (err) {
      setErrorMessage(err.message || 'AI extraction failed. You can edit the text and retry.');
      setStatus('transcribed');
    }
  };

  const handleSpeakSummary = () => {
    if (isSpeakingSummary) {
      ttsService.stop();
      setIsSpeakingSummary(false);
      return;
    }

    if (!extractedData) return;
    const summaryText = `Listing verified: ${extractedData.quantity} ${extractedData.quantityUnit} of ${extractedData.diet} ${extractedData.foodName}. Storage is ${extractedData.storage}.`;

    const langObj = LANGUAGES.find((l) => l.code === language);
    const langCode = langObj ? langObj.tts : 'en-IN';

    ttsService.speak(summaryText, {
      lang: langCode,
      rate: 1.0,
      onStart: () => setIsSpeakingSummary(true),
      onEnd: () => setIsSpeakingSummary(false),
      onError: () => setIsSpeakingSummary(false),
    });
  };

  const handleApplyToForm = () => {
    if (!extractedData) return;

    const updates = {
      foodName: extractedData.foodName,
      category: extractedData.category,
      diet: extractedData.diet,
      quantity: String(extractedData.quantity),
      storage: extractedData.storage,
      cookedAt: extractedData.cookedAt,
      deadline: extractedData.expiresAt,
    };

    if (onApplyExtractedData) {
      onApplyExtractedData(updates, extractedData);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Voice-to-Food Listing
              </h2>
              <p className="text-xs text-gray-500">
                Speak naturally in Hindi, English, or Punjabi. AI populates your listing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gray-50 p-2 dark:bg-gray-800/50">
          <span className="flex items-center gap-1.5 px-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <Globe2 className="h-3.5 w-3.5 text-emerald-600" /> Language:
          </span>
          <div className="flex flex-wrap gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                  language === lang.code
                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-emerald-300 dark:ring-gray-700'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recording Section */}
        <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-gray-50/50 p-6 text-center dark:border-gray-800 dark:bg-gray-800/20">
          {status === 'recording' ? (
            <div className="flex flex-col items-center">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
                <button
                  type="button"
                  onClick={stopRecording}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition"
                >
                  <MicOff className="h-8 w-8" />
                </button>
              </div>
              <p className="mt-4 text-sm font-bold text-rose-600 animate-pulse">
                Recording... {recordSeconds}s / 120s
              </p>
              <p className="mt-1 text-xs text-gray-500">Tap the red button when done speaking</p>

              {/* Real-time Live Speech Caption */}
              {liveInterim ? (
                <div className="mt-4 w-full max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-left dark:border-emerald-800 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <Volume2 className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
                    <span>Listening in real-time:</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200 italic">
                    "{liveInterim}"
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" /> High-accuracy speech recognizer active. Speak naturally...
                </p>
              )}
            </div>
          ) : status === 'transcribing' || status === 'extracting' ? (
            <div className="flex flex-col items-center py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
              <p className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                {status === 'transcribing' ? 'Transcribing your speech...' : 'AI is extracting food details...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={startRecording}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition hover:scale-105"
              >
                <Mic className="h-8 w-8" />
              </button>
              <p className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                {transcript ? 'Tap to Record Again' : 'Tap to Start Speaking'}
              </p>
              <p className="mt-1 max-w-sm text-xs text-gray-500">
                Example: "We have 35 plates of veg dal makhani and jeera rice, cooked 2 hours ago, keep hot, pick up before 8 PM."
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Transcript Review & Edit */}
        {transcript && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                Recognized Transcript (Editable):
              </label>
              {status !== 'extracting' && (
                <button
                  type="button"
                  onClick={() => handleExtractFood(transcript)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  <RefreshCw className="h-3 w-3" /> Re-extract
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Your transcribed speech appears here..."
            />
          </div>
        )}

        {/* AI Extracted Parameters Card */}
        {extractedData && (
          <div className="mt-5 space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-800 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                AI Extracted Details
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeakSummary}
                  className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm border border-emerald-200 dark:bg-gray-800 dark:text-emerald-300 dark:border-emerald-700"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  {isSpeakingSummary ? 'Stop Speaking' : 'Read Aloud (TTS)'}
                </button>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {Math.round((extractedData.confidenceScore || 0.95) * 100)}% Confidence
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-[11px] font-medium text-gray-500">Food Item</p>
                <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white truncate">{extractedData.foodName}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-[11px] font-medium text-gray-500">Quantity</p>
                <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">
                  {extractedData.quantity} {extractedData.quantityUnit}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-[11px] font-medium text-gray-500">Diet</p>
                <p className="mt-0.5 text-sm font-bold text-emerald-700 uppercase dark:text-emerald-300">
                  {extractedData.diet}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-[11px] font-medium text-gray-500">Storage</p>
                <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white capitalize">{extractedData.storage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          {extractedData && (
            <button
              type="button"
              onClick={handleApplyToForm}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
            >
              <span>Apply to Form</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
