import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Square, Pause } from 'lucide-react';
import ttsService from '../services/ttsService';

/**
 * TextToSpeechPlayer Component
 * Drop-in audio reader for any food listing, summary, or text.
 */
export default function TextToSpeechPlayer({
  text,
  label = 'Listen',
  defaultLang = 'en-IN',
  className = '',
}) {
  const [speaking, setSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [rate, setRate] = useState(1.0);

  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (speaking) {
      ttsService.stop();
      setSpeaking(false);
    } else {
      if (!text || !text.trim()) return;

      const ok = ttsService.speak(text, {
        lang: selectedLang,
        rate,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });

      if (ok) setSpeaking(true);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      <button
        type="button"
        onClick={handleToggleSpeak}
        disabled={!text || !text.trim()}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
          speaking
            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {speaking ? (
          <>
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Language Selector */}
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none"
      >
        <option value="en-IN">English (India)</option>
        <option value="hi-IN">हिन्दी (Hindi)</option>
        <option value="pa-IN">ਪੰਜਾਬੀ (Punjabi)</option>
        <option value="en-US">English (US)</option>
      </select>

      {/* Speed Slider */}
      <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-500">
        <span>{rate}x</span>
        <input
          type="range"
          min="0.75"
          max="1.5"
          step="0.25"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="h-1.5 w-12 accent-emerald-600 cursor-pointer"
        />
      </div>
    </div>
  );
}
