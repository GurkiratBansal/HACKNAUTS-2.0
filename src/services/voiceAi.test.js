// FRESH:FILE  Tests for new Voice AI and Extraction services.
// FRESH:AREA  Voice AI

import { describe, expect, it, vi } from 'vitest'
import { voiceService } from './voiceService'
import { ttsService } from './ttsService'
import { aiExtractionService } from './aiExtractionService'

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
    // In node/vitest environment without window.SpeechRecognition, triggers onError
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
})
