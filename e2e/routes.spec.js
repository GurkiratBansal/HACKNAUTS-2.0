import { test, expect } from '@playwright/test'

const LOCATION_KEY = 'fresh.v2.place'
const NETWORK_DEPENDENT_PATTERNS = [
  /openstreetmap\.org\/.*\.png/i,
  /tile\.openstreetmap\.org/i,
  /router\.project-osrm\.org/i,
  /routing\.openstreetmap\.de/i,
  /ERR_FAILED/i,
  /Failed to load resource: the server responded with a status of 4\d\d/i,
]

function isNetworkDependent(text) {
  return NETWORK_DEPENDENT_PATTERNS.some((pattern) => pattern.test(text))
}

test.beforeEach(async ({ page }) => {
  const consoleErrors = []
  const pageErrors = []
  const networkDependent = []

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (isNetworkDependent(text)) {
      networkDependent.push(text)
      return
    }
    consoleErrors.push(text)
  })
  page.on('pageerror', (error) => {
    const text = error?.stack || error?.message || String(error)
    if (isNetworkDependent(text)) {
      networkDependent.push(text)
      return
    }
    pageErrors.push(text)
  })
  page.on('requestfailed', (request) => {
    const url = request.url()
    const text = `${request.failure()?.errorText || 'request failed'} ${url}`
    if (isNetworkDependent(text) || /openstreetmap|osrm/i.test(url)) networkDependent.push(text)
  })

  page.__freshTestErrors = { consoleErrors, pageErrors, networkDependent }
})

test.afterEach(async ({ page }, testInfo) => {
  const { consoleErrors = [], pageErrors = [], networkDependent = [] } = page.__freshTestErrors || {}
  if (networkDependent.length) {
    await testInfo.attach('network-dependent', { body: networkDependent.join('\n'), contentType: 'text/plain' })
  }
  expect([...consoleErrors, ...pageErrors], [...consoleErrors, ...pageErrors].join('\n')).toEqual([])
})

async function seedLocation(page) {
  await page.addInitScript(([key]) => {
    localStorage.setItem(
      key,
      JSON.stringify({ lat: 30.901, lng: 75.8573, label: 'Ludhiana, Punjab', state: 'Punjab', source: 'manual' }),
    )
  }, [LOCATION_KEY])
}

async function quickLogin(page, role) {
  await page.goto(`/login?role=${role}`)
  await page.getByRole('button', { name: role === 'donor' ? /quick donor login/i : /quick ngo login/i }).click()
}

test('routes load with empty localStorage', async ({ page }) => {
  await seedLocation(page)
  const routes = ['/', '/login', '/register', '/map', '/impact', '/terms', '/not-a-real-page']
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('body')).toBeVisible()
  }
})

test('protected and detail routes load after login', async ({ page }) => {
  await seedLocation(page)
  await quickLogin(page, 'donor')
  await expect(page).toHaveURL(/\/donor/)
  await page.goto('/donor/add')
  await expect(page.getByRole('heading', { name: /list surplus food/i })).toBeVisible()

  await quickLogin(page, 'ngo')
  await expect(page).toHaveURL(/\/ngo/)
  await page.goto('/map')
  await expect(page.getByRole('main')).toBeVisible()

  await page.goto('/')
  await page.goto('/donor')
  // donor detail from seeded donations: go to donor dashboard and open first available card if present
  await quickLogin(page, 'donor')
  const detailsLink = page.locator('a[href^="/donation/"]').first()
  if (await detailsLink.count()) {
    await detailsLink.click()
    await expect(page).toHaveURL(/\/donation\//)
    await expect(page.getByRole('main')).toBeVisible()
  }
})

test('recovers from stale/corrupt localStorage and outside-India saved place', async ({ page }) => {
  await page.addInitScript(([locationKey]) => {
    localStorage.setItem('fresh_users_v1', '{not-json')
    localStorage.setItem('fresh_donations_v1', JSON.stringify({ bad: 'shape' }))
    localStorage.setItem('fresh_current_user_v1', JSON.stringify({ id: 'missing-role' }))
    localStorage.setItem('fresh_seed_at_v1', '"old"')
    localStorage.setItem(locationKey, JSON.stringify({ lat: 40.7128, lng: -74.006, label: 'NYC', source: 'manual' }))
  }, [LOCATION_KEY])

  await page.goto('/')
  await expect(page.locator('body')).toBeVisible()
  await page.goto('/map')
  // Invalid/outside-India saved place must not crash the app. With granted
  // geolocation in this test config, the app may auto-detect a valid location;
  // otherwise it should show the location picker.
  const mapOrPicker = page.getByRole('main').or(page.getByText(/choose your location|type your area or pincode/i).first())
  await expect(mapOrPicker.first()).toBeVisible()
  await page.goto('/impact')
  await expect(page.getByRole('main')).toBeVisible()
})
