/**
 * Standalone Text-to-Speech (TTS) Service
 * Uses the browser's native Web Speech Synthesis API.
 * Zero external dependencies. Supports English, Hindi, and Punjabi.
 */

class TextToSpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.speaking = false;
    this.currentUtterance = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  /**
   * Get available voices filtered by language hint ('hi', 'en', 'pa')
   * @param {string} [langCode='en']
   */
  getVoices(langCode = 'en') {
    if (!this.voices.length) this.loadVoices();
    if (!langCode || langCode === 'all') return this.voices;

    const prefix = langCode.toLowerCase();
    return this.voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  }

  /**
   * Speak the given text
   * @param {string} text - Text to read aloud
   * @param {Object} [options] - Configuration options
   * @param {string} [options.lang='en-IN'] - Language code ('en-IN', 'hi-IN', 'pa-IN', 'en-US')
   * @param {number} [options.rate=1.0] - Speed: 0.1 to 10 (default 1.0)
   * @param {number} [options.pitch=1.0] - Pitch: 0 to 2 (default 1.0)
   * @param {number} [options.volume=1.0] - Volume: 0 to 1 (default 1.0)
   * @param {Function} [options.onStart] - Callback when speech starts
   * @param {Function} [options.onEnd] - Callback when speech ends
   * @param {Function} [options.onError] - Callback on error
   */
  speak(text, options = {}) {
    if (!this.synth) {
      console.warn('Text-to-Speech is not supported in this environment.');
      return false;
    }

    // Cancel any ongoing speech
    this.stop();

    if (!text || !text.trim()) return false;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    const lang = options.lang || 'en-IN';
    utterance.lang = lang;
    utterance.rate = options.rate !== undefined ? options.rate : 1.0;
    utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    // Select suitable voice
    if (!this.voices.length) this.loadVoices();
    const matchingVoice = this.voices.find(
      (v) =>
        v.lang.toLowerCase() === lang.toLowerCase() ||
        v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase())
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.speaking = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.speaking = false;
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (err) => {
      this.speaking = false;
      this.currentUtterance = null;
      if (options.onError) options.onError(err);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.speaking = false;
      this.currentUtterance = null;
    }
  }

  isSpeaking() {
    return Boolean(this.synth && (this.synth.speaking || this.speaking));
  }
}

export const ttsService = new TextToSpeechService();
export default ttsService;
