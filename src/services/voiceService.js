/**
 * Standalone Speech-to-Text (STT) Client Service
 * Supports real-time browser Web Speech API and backend API transcription.
 */

export const voiceService = {
  /**
   * Check if browser supports speech recognition
   */
  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  /**
   * Check if browser supports audio media recording
   */
  isMediaRecorderSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  },

  /**
   * Start live speech recognition in browser
   * @param {Object} options
   * @param {string} [options.language='en-IN'] - 'en-IN', 'hi-IN', 'pa-IN'
   * @param {Function} options.onResult - callback with (currentTranscript, isFinal)
   * @param {Function} [options.onError] - callback on error
   */
  startLiveRecognition({ language = 'en-IN', onResult, onError }) {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      if (onError) onError(new Error('SpeechRecognition is not supported in this browser.'));
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    let accumulatedFinal = '';

    recognition.onresult = (event) => {
      let interimStr = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          accumulatedFinal += item[0].transcript + ' ';
        } else {
          interimStr += item[0].transcript;
        }
      }
      const combined = (accumulatedFinal + ' ' + interimStr).replace(/\s+/g, ' ').trim();
      if (onResult) onResult(combined);
    };

    recognition.onerror = (e) => {
      if (onError) onError(e);
    };

    recognition.start();
    return recognition;
  },

  /**
   * Send audio Blob to backend transcription API
   * @param {Blob|File} audioBlob - Audio recording
   * @param {string} [language='auto'] - Language hint
   * @param {string} [apiUrl='http://localhost:4000/api/v1/voice/transcribe']
   */
  async transcribeAudio(audioBlob, language = 'auto', apiUrl = '/api/v1/voice/transcribe') {
    const formData = new FormData();
    const filename = audioBlob instanceof File ? audioBlob.name : 'voice-recording.webm';
    formData.append('audio', audioBlob, filename);
    formData.append('language', language);

    const res = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || `Transcription failed with status ${res.status}`);
    }

    const data = await res.json();
    return data?.data || data;
  },

  /**
   * Send Base64 audio to backend transcription API
   */
  async transcribeBase64(audioBase64, mimeType = 'audio/webm', language = 'auto', apiUrl = '/api/v1/voice/transcribe') {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType, language }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || `Transcription failed with status ${res.status}`);
    }

    const data = await res.json();
    return data?.data || data;
  },
};

export default voiceService;
