/**
 * Standalone AI Food Parameter Extraction Client
 */

export const aiExtractionService = {
  /**
   * Extract structured food listing parameters from speech transcript
   * @param {Object} payload
   * @param {string} payload.transcript - Spoken or typed natural language description
   * @param {string} [payload.language='auto'] - Language code hint
   * @param {string} [payload.referenceTime] - ISO reference timestamp
   * @param {string} [apiUrl='http://localhost:4000/api/v1/ai-extraction/food']
   */
  async extractFood({ transcript, language = 'auto', referenceTime = new Date().toISOString() }, apiUrl = '/api/v1/ai-extraction/food') {
    if (!transcript || !transcript.trim()) {
      throw new Error('Transcript is required for food extraction');
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: transcript.trim(),
        language,
        referenceTime,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || `AI Extraction failed with status ${res.status}`);
    }

    const data = await res.json();
    return data?.data || data;
  },
};

export default aiExtractionService;
