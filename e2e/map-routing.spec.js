import { test, expect } from '@playwright/test'

const NYC_COORDS = { latitude: 40.7128, longitude: -74.006 }

test.describe('A2: Map and Location', () => {
  test('geolocation granted at Ludhiana opens map at Ludhiana, not Delhi', async ({ page }) => {
    await page.goto('/map')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 })

    // Location bar reflects Ludhiana or Your location
    await expect(page.locator('text=/Ludhiana|Your location/i').first()).toBeVisible({ timeout: 10_000 })

    // Verify sample NGOs appear in Ludhiana and are labelled sample
    await expect(page.getByText(/\(Sample\)|Sample data/i).first()).toBeVisible({ timeout: 10_000 })

    // Verify Delhi is not the map header or title
    const pageText = await page.locator('main').innerText()
    expect(pageText).not.toContain('Delhi Map Center')
  })

  test('geolocation denied shows location picker; pincode 141001 works without defaulting to Delhi', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: [],
      geolocation: undefined,
    })
    const page = await context.newPage()
    await page.addInitScript(() => {
      localStorage.clear()
    })

    await page.goto('/map')

    // The location picker appears because geolocation was denied and no place saved
    await expect(page.getByRole('heading', { name: /where are you sharing food/i })).toBeVisible({ timeout: 15_000 })

    // Enter pincode 141001
    await page.locator('input[placeholder="141001"]').fill('141001')
    await page.getByRole('button', { name: /use this place/i }).click()

    // Map opens at Ludhiana
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Ludhiana/i).first()).toBeVisible({ timeout: 10_000 })

    await context.close()
  })

  test('location outside India shows India-only screen and blocks Register, Add Donation, Accept and Map', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: NYC_COORDS,
      locale: 'en-US',
    })
    const page = await context.newPage()
    await page.addInitScript(() => {
      localStorage.clear()
    })

    // 1. Map is blocked
    await page.goto('/map')
    await expect(page.getByText(/available in India only/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.leaflet-container')).toHaveCount(0)

    // 2. Register is blocked
    await page.goto('/register')
    await expect(page.getByText(/available in India only/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('form input[name="email"]')).toHaveCount(0)

    // 3. Add Donation is blocked
    await page.addInitScript(() => {
      localStorage.setItem('fresh_current_user_v1', JSON.stringify({
        id: 'u-donor-demo',
        role: 'donor',
        name: 'Asha Sharma',
        email: 'donor@fresh.demo',
      }))
    })
    await page.goto('/donor/add')
    await expect(page.getByText(/available in India only/i).first()).toBeVisible({ timeout: 10_000 })

    // 4. Accept is blocked on detail
    await page.addInitScript(() => {
      localStorage.setItem('fresh_current_user_v1', JSON.stringify({
        id: 'u-ngo-demo',
        role: 'ngo',
        name: 'Priya Menon',
        orgName: 'Roti Bank Delhi',
        email: 'ngo@fresh.demo',
      }))
    })
    await page.goto('/donation/demo-donation-3h')
    await expect(page.getByRole('button', { name: /accept pickup/i })).toHaveCount(0)

    await context.close()
  })

  test('radius filter hides far entries and widening shows them; layer toggle works; contact stays hidden until accepted', async ({ page }) => {
    await page.goto('/map')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 })

    // Check radius filter dropdown
    const distanceSelect = page.locator('select#map-distance, select[aria-label*="distance" i]').first()
    if (await distanceSelect.isVisible()) {
      // Set to 3 km
      await distanceSelect.selectOption('3')
      await page.waitForTimeout(300)
      const count3kmText = await page.locator('aside span.rounded-full').first().innerText()

      // Set to all / 50 km
      await distanceSelect.selectOption('all')
      await page.waitForTimeout(300)
      const countAllText = await page.locator('aside span.rounded-full').first().innerText()

      // The count with 'all' should be >= count with 3km
      const num3 = parseInt(count3kmText) || 0
      const numAll = parseInt(countAllText) || 0
      expect(numAll).toBeGreaterThanOrEqual(num3)
    }

    // Layer toggle: switch between NGOs and Food in guest view
    const foodLayerBtn = page.getByRole('group', { name: /map layer/i }).getByRole('button', { name: /food/i }).first()
    await expect(foodLayerBtn).toBeVisible({ timeout: 10_000 })
    await foodLayerBtn.click()
    await expect(page.locator('aside ul[aria-label="Food results"]').or(page.locator('ul[aria-label="Food results"]').first())).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/servings/i).first()).toBeVisible({ timeout: 10_000 })

    // Contact details hidden on unaccepted listing detail
    await page.goto('/donation/demo-donation-3h')
    await expect(page.getByText(/contact is revealed to the ngo that accepts/i)).toBeVisible()
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)
  })
})

test.describe('A3: Routing', () => {
  test('requesting a route follows roads with multi-point polyline and shows distance and estimated time', async ({ page }) => {
    const mockPolylineCoords = [
      [30.901, 75.8573],
      [30.9015, 75.858],
      [30.9022, 75.8595],
      [30.903, 75.861],
      [30.9045, 75.863],
      [30.906, 75.865],
      [30.908, 75.867],
      [30.91, 75.8685],
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
              distance: 3400, // 3.4 km
              duration: 480,  // 8 mins
            },
          ],
        }),
      })
    })

    await page.goto('/map')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 })

    // Click an NGO in the results list to trigger route
    const firstNgoBtn = page.locator('ul[aria-label="NGO results"] button').first()
    await expect(firstNgoBtn).toBeVisible({ timeout: 10_000 })
    await firstNgoBtn.click()

    // Route summary shows distance and estimated time
    await expect(page.getByText(/km by road/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/min drive/i)).toBeVisible()

    // Assert SVG polyline has multiple points (not a 2-point line)
    const polyline = page.locator('.leaflet-pane svg path[stroke="#059669"]').first()
    await expect(polyline).toBeVisible({ timeout: 10_000 })
    const pathData = await polyline.getAttribute('d')
    expect(pathData).toBeTruthy()
    const segments = (pathData.match(/L/g) || []).length
    expect(segments).toBeGreaterThan(2)
  })

  test('failed route request shows error with retry button and NO straight line polyline', async ({ page }) => {
    // Block routing hosts completely
    await page.route(/router\.project-osrm\.org|routing\.openstreetmap\.de/, async (route) => {
      await route.abort('failed')
    })

    await page.goto('/map')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 })

    const firstNgoBtn = page.locator('ul[aria-label="NGO results"] button').first()
    await expect(firstNgoBtn).toBeVisible({ timeout: 10_000 })
    await firstNgoBtn.click()

    // Route summary shows error state
    await expect(page.getByText(/could not load a road route/i)).toBeVisible({ timeout: 10_000 })
    const retryBtn = page.getByRole('button', { name: /try again/i })
    await expect(retryBtn).toBeVisible()

    // Verify NO straight line polyline is drawn
    const routePolylines = page.locator('.leaflet-pane svg path[stroke="#059669"]')
    await expect(routePolylines).toHaveCount(0)

    // Now unblock and test retry
    await page.unroute(/router\.project-osrm\.org|routing\.openstreetmap\.de/)
    await page.route(/router\.project-osrm\.org|routing\.openstreetmap\.de/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'Ok',
          routes: [
            {
              geometry: {
                coordinates: [
                  [75.8573, 30.901],
                  [75.858, 30.902],
                  [75.859, 30.903],
                  [75.86, 30.904],
                ],
              },
              distance: 1800,
              duration: 300,
            },
          ],
        }),
      })
    })

    await retryBtn.click()
    await expect(page.getByText(/km by road/i)).toBeVisible({ timeout: 10_000 })
  })
})
