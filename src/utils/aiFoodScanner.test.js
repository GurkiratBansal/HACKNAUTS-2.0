// FRESH:FILE  Tests for AI Food Vision Scanner & Nutrition Calculator.
// FRESH:AREA  Donations

import { describe, expect, it } from 'vitest'
import {
  FOOD_DATABASE,
  identifyFoodFromImage,
  runAiFoodAnalysis,
} from './aiFoodScanner'

describe('AI Food Scanner & Nutrition Profiler', () => {
  it('contains comprehensive food safety and nutrition database', () => {
    expect(FOOD_DATABASE.length).toBeGreaterThanOrEqual(8)
    for (const item of FOOD_DATABASE) {
      expect(item.name).toBeTruthy()
      expect(item.calories).toBeGreaterThan(50)
      expect(item.protein).toBeGreaterThanOrEqual(0)
      expect(item.carbs).toBeGreaterThanOrEqual(0)
      expect(item.safetyScore).toBeGreaterThanOrEqual(90)
      expect(item.safetyChecks.length).toBeGreaterThanOrEqual(2)
      expect(item.allergens).toBeDefined()
    }
  })

  it('accurately identifies Biryani from filename or keywords', () => {
    const match = identifyFoodFromImage({ name: 'my_veg_biryani_pot.jpg' })
    expect(match.name).toContain('Biryani')
    expect(match.category).toBe('cooked')
    expect(match.diet).toBe('veg')
    expect(match.calories).toBe(380)
  })

  it('accurately identifies Dal Makhani from filename', () => {
    const match = identifyFoodFromImage({ name: 'fresh_dal_makhani.png' })
    expect(match.name).toContain('Dal Makhani')
    expect(match.protein).toBe(15)
  })

  it('accurately identifies Paneer Butter Masala from filename', () => {
    const match = identifyFoodFromImage({ name: 'paneer_curry_tray.jpg' })
    expect(match.name).toContain('Paneer')
    expect(match.protein).toBe(18)
    expect(match.allergens).toContain('Dairy (Paneer/Butter)')
  })

  it('accurately identifies Rajma Chawal from filename', () => {
    const match = identifyFoodFromImage({ name: 'rajma_rice_catering.jpeg' })
    expect(match.name).toContain('Rajma')
    expect(match.fiber).toBe(9)
  })

  it('falls back safely to default wholesome meal when filename is ambiguous', () => {
    const match = identifyFoodFromImage({ name: 'IMG_20261115_123456.jpg' })
    expect(match).toBeDefined()
    expect(match.name).toBe('Vegetable Biryani with Raita')
    expect(match.safetyScore).toBeGreaterThanOrEqual(95)
  })

  it('runs full AI analysis and auto-computes portion calories and safety checklist', async () => {
    const result = await runAiFoodAnalysis({ name: 'delicious_biryani.jpg' })
    expect(result.foodName).toContain('Biryani')
    expect(result.quantity).toBe('50')
    expect(result.safetyScore).toBe(98)
    expect(result.safetyChecks.length).toBeGreaterThan(0)
    expect(result.nutrition.calories).toBe(380)
    expect(result.nutrition.totalCalories).toBe(380 * 50)
    expect(result.nutrition.protein).toBe(12)
    expect(result.nutrition.allergens).toBeDefined()
    expect(result.suggestedNotes).toContain('AI Safety Certified')
  })
})
