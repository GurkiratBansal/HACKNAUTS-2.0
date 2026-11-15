// FRESH:FILE  Tests for new Voice AI and Extraction services.
// FRESH:AREA  Voice AI

import { describe, expect, it, vi } from 'vitest'
import { voiceService } from './voiceService'
import { ttsService } from './ttsService'
import { aiExtractionService } from './aiExtractionService'
import { normalizeSpokenPhone, INTERVIEW_QUESTIONS } from '../components/donation/VoiceListingModal'

describe('voiceService', () => {
  it('detects browser support methods safely', () => {
    expect(typeof voiceService.isSpeechRecognitionSupported).toBe('function')
    expect(typeof voiceService.isMediaRecorderSupported).toBe('function')
  })

  it('handles live recognition fallback when unsupported gracefully', () => {
    const onError = vi.fn()
    const rec = voiceService.startLiveRecognition({
      language: 'en-IN',
      onResult: () => {},
      onError,
    })
    expect(onError).toHaveBeenCalled()
    expect(rec).toBeNull()
  })
})

describe('ttsService', () => {
  it('initializes safely in testing environment', () => {
    expect(ttsService).toBeDefined()
    expect(typeof ttsService.speak).toBe('function')
    expect(typeof ttsService.stop).toBe('function')
    expect(typeof ttsService.getVoices).toBe('function')
  })

  it('safely handles empty text without error', () => {
    const res = ttsService.speak('')
    expect(res).toBe(false)
  })
})

describe('aiExtractionService', () => {
  it('throws error when transcript is missing', async () => {
    await expect(aiExtractionService.extractFood({ transcript: '' })).rejects.toThrow(
      'Transcript is required for food extraction',
    )
  })

  it('calls API endpoint with payload', async () => {
    const fakeResponse = {
      success: true,
      data: {
        foodName: 'Dal Makhani',
        quantity: 20,
        diet: 'veg',
      },
    }
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    })

    const data = await aiExtractionService.extractFood({
      transcript: '20 plates of dal makhani',
    })
    expect(data.foodName).toBe('Dal Makhani')
    expect(data.quantity).toBe(20)

    global.fetch = originalFetch
  })

  it('calls researchExpiry endpoint and returns research findings', async () => {
    const fakeResearch = {
      success: true,
      data: {
        foodName: 'Paneer Butter Masala',
        safeHoursTotal: 3,
        safeRemainingHours: 2,
        scientificReason: 'Dairy proteins vulnerable to lactic fermentation.',
        authorityStandards: 'FSSAI Guidance',
      },
    }
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResearch,
    })

    const result = await aiExtractionService.researchExpiry({
      foodName: 'Paneer Butter Masala',
      storage: 'room',
    })
    expect(result.foodName).toBe('Paneer Butter Masala')
    expect(result.safeHoursTotal).toBe(3)
    expect(result.scientificReason).toContain('Dairy')

    global.fetch = originalFetch
  })
})

describe('VoiceListingModal Helpers', () => {
  it('contains all 10 questions to fill the complete donation form', () => {
    expect(INTERVIEW_QUESTIONS.length).toBe(10)
    const keys = INTERVIEW_QUESTIONS.map((q) => q.key)
    expect(keys).toContain('foodName')
    expect(keys).toContain('diet')
    expect(keys).toContain('category')
    expect(keys).toContain('quantity')
    expect(keys).toContain('cookedAt')
    expect(keys).toContain('storage')
    expect(keys).toContain('expiryAnswer')
    expect(keys).toContain('address')
    expect(keys).toContain('contactPhone')
    expect(keys).toContain('notes')
  })

  it('normalizes spoken phone numbers into 10-digit format', () => {
    expect(normalizeSpokenPhone('nine eight seven six five four three two one zero')).toBe('9876543210')
    expect(normalizeSpokenPhone('my number is 9814012345 please call')).toBe('9814012345')
    expect(normalizeSpokenPhone('double nine eight seven six five four three two one')).toBe('9987654321')
  })
})
