import { test } from '@playwright/test'
import path from 'node:path'

const OUT = path.resolve('test-results/restyle-proof')

test.describe('Restyle Capture', () => {
  test('Capture key views at multiple breakpoints', async ({ page }) => {
    // 1. Home desktop 1280
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT, 'restyle-home-1280.png') })

    // 2. Home tablet 768
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT, 'restyle-home-768.png') })

    // 3. Home mobile 360
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/')
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT, 'restyle-home-360.png') })

    // 4. NGO Dashboard 1280
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.addInitScript(() => {
      localStorage.setItem(
        'fresh.v2.place',
        JSON.stringify({ lat: 30.901, lng: 75.8573, label: 'Ludhiana, Punjab', state: 'Punjab', source: 'manual' }),
      )
    })
    await page.goto('/login?role=ngo')
    await page.getByRole('button', { name: /quick ngo login/i }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, 'restyle-ngo-dashboard-1280.png') })

    // 5. Add Donation 1280
    await page.goto('/donor/add')
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT, 'restyle-add-donation-1280.png') })

    // 6. Map 1280
    await page.goto('/map')
    await page.waitForSelector('.leaflet-container', { timeout: 15000 })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(OUT, 'restyle-map-1280.png') })

    // 7. Impact 1280
    await page.goto('/impact')
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT, 'restyle-impact-1280.png') })
  })
})
