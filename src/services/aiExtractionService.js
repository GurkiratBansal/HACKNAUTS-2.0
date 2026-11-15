// FRESH:FILE  AI Food Parameter Extraction and Food Safety Research Client.
// FRESH:AREA  Voice AI

/**
 * Standalone AI Food Parameter Extraction & Research Client
 */
export const aiExtractionService = {
  /**
   * Extract structured food listing parameters from speech transcript
   * @param {Object} payload
   * @param {string} payload.transcript - Spoken or typed natural language description
   * @param {string} [payload.language='auto'] - Language code hint
   * @param {string} [payload.referenceTime] - ISO reference timestamp
   * @param {string} [apiUrl='/api/v1/ai-extraction/food']
   */
  async extractFood(
    { transcript, language = 'auto', referenceTime = new Date().toISOString() },
    apiUrl = '/api/v1/ai-extraction/food',
  ) {
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

  /**
   * Run online food safety and expiry research on a dish
   * @param {Object} payload
   * @param {string} payload.foodName - Dish name
   * @param {string} [payload.storage='room'] - 'room', 'hot', 'refrigerated'
   * @param {string} [payload.category='cooked']
   * @param {string} [payload.diet='veg']
   * @param {string} [payload.cookedAt]
   * @param {string} [apiUrl='/api/v1/ai-extraction/research-expiry']
   */
  async researchExpiry(payload, apiUrl = '/api/v1/ai-extraction/research-expiry') {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || `Expiry research failed with status ${res.status}`);
    }

    const data = await res.json();
    return data?.data || data;
  },
};

export default aiExtractionService;
