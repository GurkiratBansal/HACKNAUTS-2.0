import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const LOCATION_KEY = 'fresh.v2.place'
const SCREENSHOTS_DIR = path.resolve('test-results/visual-proof')

test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  }
})

function dtLocal(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

test.describe('Visual Proof Suite', () => {
  test('1. Donor to NGO journey with declaration audit and screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.addInitScript(([locationKey]) => {
      if (window.sessionStorage.getItem('__fresh_vp_init')) return
      window.sessionStorage.setItem('__fresh_vp_init', '1')
      localStorage.clear()
      localStorage.setItem(
        locationKey,
        JSON.stringify({ lat: 30.901, lng: 75.8573, label: 'Ludhiana, Punjab', state: 'Punjab', source: 'manual' }),
      )
    }, [LOCATION_KEY])

    // Quick donor login
    await page.goto('/login?role=donor')
    await page.getByRole('button', { name: /quick donor login/i }).click()
    await expect(page).toHaveURL(/\/donor/)

    // Fill donation form
    await page.goto('/donor/add')
    await expect(page.getByRole('heading', { name: /list surplus food/i })).toBeVisible()
    await page.locator('#food-name').fill('Visual Proof Kheer')
    await page.locator('#food-quantity').fill('50')
    await page.getByRole('button', { name: /continue/i }).click()

    const now = Date.now()
    await page.locator('#food-cooked').fill(dtLocal(now - 30 * 60 * 1000))
    await page.locator('#food-deadline').fill(dtLocal(now + 120 * 60 * 1000))
    await page.locator('#food-phone').fill('9876543210')
    await page.getByRole('button', { name: /continue/i }).click()

    await page.locator('#food-address').fill('Model Town, Ludhiana')
    const useLocationBtn = page.getByRole('button', { name: /use my current location/i })
    if (await useLocationBtn.isVisible().catch(() => false)) {
      await useLocationBtn.click()
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-donation-form-filled.png') })
    await page.getByRole('button', { name: /continue/i }).click()

    // Open Declaration Modal
    await page.getByRole('button', { name: /review & publish|review and publish/i }).click()
    const declaration = page.getByRole('dialog', { name: /food donation declaration/i })
    await expect(declaration).toBeVisible()

    // Verify declaration wording word-for-word
    const declarationText = await declaration.innerText()
    expect(declarationText).toContain('information is accurate')
    expect(declarationText).toContain('prepared and handled responsibly')
    expect(declarationText).toContain('receiving organization will independently inspect it')
    expect(declarationText).not.toContain('safe to consume')
    expect(declarationText).not.toContain('guaranteed safe')
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-food-declaration-modal.png') })

    await declaration.getByRole('checkbox').check()
    await declaration.getByRole('button', { name: /confirm.*publish donation/i }).click()
    await expect(page).toHaveURL(/\/donation\//)
    const detailsHref = page.url()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-published-donation-detail.png') })

    // View Donor Dashboard
    await page.goto('/donor')
    await expect(page.getByRole('heading', { name: /Visual Proof Kheer/i }).first()).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-donor-dashboard-listing.png') })

    // NGO Login & Accept on details page
    await page.goto('/login?role=ngo')
    await page.getByRole('button', { name: /quick ngo login/i }).click()
    await expect(page).toHaveURL(/\/ngo/)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-ngo-dashboard.png') })

    // Navigate to listing detail as NGO
    await page.goto(detailsHref)
    await page.locator('main').getByRole('button', { name: /accept pickup|accept this pickup/i }).first().click()
    await expect(page.getByRole('button', { name: /mark as picked up|mark picked up/i })).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-accepted-listing.png') })

    // Mark picked up
    await page.getByRole('button', { name: /mark as picked up|mark picked up/i }).click()
    await expect(page.getByRole('button', { name: /mark as distributed|mark distributed/i })).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-picked-up-listing.png') })

    // Mark distributed
    await page.getByRole('button', { name: /mark as distributed|mark distributed/i }).click()
    await expect(page.getByText(/distributed/i).first()).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-distributed-listing.png') })

    // Impact page
    await page.goto('/impact')
    await expect(page.getByRole('heading', { name: /every meal counts/i })).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-impact-dashboard.png') })
  })

  test('2. Map in Ludhiana: granted GPS, denied GPS with pincode 141001', async ({ browser }) => {
    // 2a. Geolocation granted at Ludhiana
    const grantedContext = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: { latitude: 30.901, longitude: 75.8573 },
    })
    const grantedPage = await grantedContext.newPage()
    await grantedPage.goto('/map')
    await expect(grantedPage.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    await grantedPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-map-ludhiana-granted.png') })
    await grantedContext.close()

    // 2b. Geolocation denied + enter pincode 141001
    const deniedContext = await browser.newContext({
      permissions: [],
      geolocation: undefined,
    })
    const deniedPage = await deniedContext.newPage()
    await deniedPage.addInitScript(() => { localStorage.clear() })
    await deniedPage.goto('/map')

    await expect(deniedPage.getByRole('heading', { name: /where are you sharing food/i })).toBeVisible({ timeout: 15000 })
    await deniedPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-location-picker-denied.png') })

    await deniedPage.locator('input[placeholder="141001"]').fill('141001')
    await deniedPage.getByRole('button', { name: /use this place/i }).click()

    await expect(deniedPage.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    await expect(deniedPage.getByText(/Ludhiana/i).first()).toBeVisible({ timeout: 10000 })
    await deniedPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '12-map-ludhiana-pincode-141001.png') })
    await deniedContext.close()
  })

  test('3. Road routing with road polyline and distance/time summary', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const mockPolylineCoords = [
      [30.901, 75.8573],
      [30.9018, 75.8585],
      [30.9025, 75.8601],
      [30.9038, 75.8622],
      [30.9052, 75.8645],
      [30.9071, 75.867],
      [30.909, 75.8688],
      [30.9117, 75.8574],
    ]

    await page.route(/router\.project-osrm\.org|routing\.openstreetmap\.de/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'Ok',
          routes: [
            {
              geometry: {
                coordinates: mockPolylineCoords.map(([lat, lng]) => [lng, lat]),
              },
              distance: 3100, // 3.1 km
              duration: 420,  // 7 mins
            },
          ],
        }),
      })
    })

    await page.addInitScript(([locationKey]) => {
      if (window.sessionStorage.getItem('__fresh_vp_init')) return
      window.sessionStorage.setItem('__fresh_vp_init', '1')
      localStorage.clear()
      localStorage.setItem(
        locationKey,
        JSON.stringify({ lat: 30.901, lng: 75.8573, label: 'Ludhiana, Punjab', state: 'Punjab', source: 'manual' }),
      )
    }, [LOCATION_KEY])

    await page.goto('/map')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })

    const firstNgoBtn = page.locator('aside ul[aria-label="NGO results"] button').first()
    await firstNgoBtn.click()

    const routeSummary = page.locator('div[role="status"]', { hasText: /road route/i })
    await expect(routeSummary).toBeVisible({ timeout: 15000 })
    await expect(routeSummary.getByText(/3\.1 km by road/i)).toBeVisible()
    await expect(routeSummary.getByText(/7 min drive/i)).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13-road-routing-polyline-summary.png') })
  })

  test('4. Responsive 360px mobile views across main pages', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.addInitScript(([locationKey]) => {
      if (window.sessionStorage.getItem('__fresh_vp_init')) return
      window.sessionStorage.setItem('__fresh_vp_init', '1')
      localStorage.clear()
      localStorage.setItem(
        locationKey,
        JSON.stringify({ lat: 30.901, lng: 75.8573, label: 'Ludhiana, Punjab', state: 'Punjab', source: 'manual' }),
      )
    }, [LOCATION_KEY])

    // Home 360px
    await page.goto('/')
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14-home-360px.png') })

    // Map 360px
    await page.goto('/map')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15-map-360px.png') })

    // Donation detail 360px
    await page.goto('/donation/demo-donation-3h')
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16-donation-detail-360px.png') })
  })
})
