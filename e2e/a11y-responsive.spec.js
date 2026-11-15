import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const LOCATION_KEY = 'fresh.v2.place'

const PAGES = [
  { name: 'Home', path: '/', auth: null },
  { name: 'Add Donation', path: '/donor/add', auth: 'donor' },
  { name: 'NGO Dashboard', path: '/ngo', auth: 'ngo' },
  { name: 'Map', path: '/map', auth: null },
  { name: 'Donation Detail', path: '/donation/demo-donation-3h', auth: null },
]

const VIEWPORTS = [
  { name: '360px Mobile', width: 360, height: 740 },
  { name: '1280px Desktop', width: 1280, height: 800 },
]

test.describe('B2: Responsive and Accessibility Pass', () => {
  for (const vp of VIEWPORTS) {
    for (const p of PAGES) {
      test(`${p.name} at ${vp.name} (${vp.width}px): no horizontal scroll and no serious/critical axe violations`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })

        await page.addInitScript(([locationKey]) => {
          localStorage.clear()
          localStorage.setItem(
            locationKey,
            JSON.stringify({ lat: 30.901, lng: 75.8573, label: 'Ludhiana, Punjab', state: 'Punjab', source: 'manual' }),
          )
        }, [LOCATION_KEY])

        if (p.auth) {
          await page.goto(`/login?role=${p.auth}`)
          await page.getByRole('button', { name: p.auth === 'donor' ? /quick donor login/i : /quick ngo login/i }).click()
        }

        await page.goto(p.path)
        await page.waitForLoadState('networkidle')

        // 1. Verify no horizontal scroll (tolerance of 1px for subpixel rendering)
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        const innerWidth = await page.evaluate(() => window.innerWidth)
        expect(scrollWidth, `Page ${p.name} at ${vp.width}px has horizontal overflow`).toBeLessThanOrEqual(innerWidth + 1)

        // 2. Run Axe accessibility scan for serious and critical issues
        const axeResults = await new AxeBuilder({ page })
          .exclude('.leaflet-container') // Leaflet third-party map canvas/tiles
          .analyze()

        const seriousOrCritical = axeResults.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        )

        if (seriousOrCritical.length > 0) {
          console.error(`Axe violations on ${p.name} (${vp.width}px):`, JSON.stringify(seriousOrCritical, null, 2))
        }

        expect(
          seriousOrCritical.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
          `Axe serious/critical violations on ${p.name}`,
        ).toEqual([])
      })
    }
  }
})
