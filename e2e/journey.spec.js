import { test, expect } from '@playwright/test'

const LOCATION_KEY = 'fresh.v2.place'
const DONATIONS_KEY = 'fresh_donations_v1'
const SEED_AT_KEY = 'fresh_seed_at_v1'

const NETWORK_DEPENDENT_PATTERNS = [
  /openstreetmap\.org\/.*\.png/i,
  /tile\.openstreetmap\.org/i,
  /router\.project-osrm\.org/i,
  /routing\.openstreetmap\.de/i,
  /ERR_FAILED/i,
  /Failed to load resource: the server responded with a status of 4\d\d/i,
  /net::ERR_/i,
]

function isNetworkDependent(text) {
  return NETWORK_DEPENDENT_PATTERNS.some((pattern) => pattern.test(text))
}

function dtLocal(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

test.beforeEach(async ({ page }) => {
  const consoleErrors = []
  const pageErrors = []
  const networkDependent = []

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (isNetworkDependent(text)) networkDependent.push(text)
    else consoleErrors.push(text)
  })
  page.on('pageerror', (error) => {
    const text = error?.stack || error?.message || String(error)
    if (isNetworkDependent(text)) networkDependent.push(text)
    else pageErrors.push(text)
  })
  page.on('requestfailed', (request) => {
    const url = request.url()
    const text = `${request.failure()?.errorText || 'request failed'} ${url}`
    if (isNetworkDependent(text) || /openstreetmap|osrm/i.test(url)) networkDependent.push(text)
  })

  page.__freshTestErrors = { consoleErrors, pageErrors, networkDependent }

  // One-time init per test: run on first document load only so reload/navigation
  // within the test preserves auth/donation state.
  await page.addInitScript(([locationKey, now]) => {
    if (window.sessionStorage.getItem('__fresh_e2e_init')) return
    window.sessionStorage.setItem('__fresh_e2e_init', '1')
    localStorage.clear()
    localStorage.setItem(
      locationKey,
      JSON.stringify({ lat: 30.901, lng: 75.8573, label: 'Ludhiana, Punjab', state: 'Punjab', source: 'manual' }),
    )
    localStorage.setItem('fresh_seed_at_v1', String(now))
  }, [LOCATION_KEY, Date.now()])
})

test.afterEach(async ({ page }, testInfo) => {
  const { consoleErrors = [], pageErrors = [], networkDependent = [] } = page.__freshTestErrors || {}
  if (networkDependent.length) {
    await testInfo.attach('network-dependent', { body: networkDependent.join('\n'), contentType: 'text/plain' })
  }
  expect([...consoleErrors, ...pageErrors], [...consoleErrors, ...pageErrors].join('\n')).toEqual([])
})

async function ensureLudhianaPlace(page) {
  const pickerHeading = page.getByRole('heading', { name: /where are you sharing food/i })
  if (await pickerHeading.isVisible().catch(() => false)) {
    const demoBtn = page.getByRole('button', { name: /use ludhiana location/i })
    if (await demoBtn.isVisible().catch(() => false)) {
      await demoBtn.click()
    } else {
      const pinInput = page.locator('input[placeholder="141001"]')
      if (await pinInput.isVisible().catch(() => false)) {
        await pinInput.fill('141001')
        await page.getByRole('button', { name: /use this place/i }).click()
      }
    }
  }
}

async function quickLogin(page, role) {
  await page.goto(`/login?role=${role}`)
  await page.getByRole('button', { name: role === 'donor' ? /quick donor login/i : /quick ngo login/i }).click()
  await expect(page).toHaveURL(role === 'donor' ? /\/donor/ : /\/ngo/)
  await ensureLudhianaPlace(page)
}

async function fillDonationForm(page, { name = 'Journey Veg Biryani', qty = '25', deadlineOffsetMin = 120, cookedOffsetMin = -30 } = {}) {
  const now = Date.now()
  const cooked = dtLocal(now + cookedOffsetMin * 60 * 1000)
  const deadline = dtLocal(now + deadlineOffsetMin * 60 * 1000)

  await page.goto('/donor/add')
  await expect(page.getByRole('heading', { name: /list surplus food/i })).toBeVisible()

  await page.locator('#food-name').fill(name)
  await page.locator('#food-quantity').fill(String(qty))
  await page.getByRole('button', { name: /continue/i }).click()

  await page.locator('#food-cooked').fill(cooked)
  await page.locator('#food-deadline').fill(deadline)
  await page.locator('#food-phone').fill('9876543210')
  await page.getByRole('button', { name: /continue/i }).click()

  await page.locator('#food-address').fill('Model Town, Ludhiana')
  // ensure place exists and pickup pin is set
  await ensureLudhianaPlace(page)
  const useLocationBtn = page.getByRole('button', { name: /use my current location/i })
  if (await useLocationBtn.isVisible().catch(() => false)) {
    await useLocationBtn.click()
  }
  await expect(page.getByText(/selected:/i)).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: /continue/i }).click()

  await page.getByRole('button', { name: /review & publish|review and publish/i }).click()
  const declaration = page.getByRole('dialog', { name: /food donation declaration/i })
  await expect(declaration).toBeVisible()
  await declaration.getByRole('checkbox').check()
  await declaration.getByRole('button', { name: /confirm.*publish donation/i }).click()
  await expect(page).toHaveURL(/\/donation\//)
  await page.goto('/donor')
  await expect(page).toHaveURL(/\/donor/)
}

test('demo journey: donor lists, NGO accepts and advances, impact increases, refresh persists', async ({ page }) => {
  // capture baseline impact
  await page.goto('/impact')
  const impactTextBefore = await page.getByRole('main').innerText()

  await quickLogin(page, 'donor')
  await fillDonationForm(page, { name: 'E2E Journey Curry', qty: '30' })

  // donor dashboard shows listing with countdown and urgency badge
  await expect(page.getByRole('heading', { name: /E2E Journey Curry/i }).first()).toBeVisible()
  const card = page.locator('article', { has: page.getByRole('heading', { name: /E2E Journey Curry/i }) }).first()
  await expect(card).toBeVisible()
  await expect(card.getByText(/left|past deadline/i).first()).toBeVisible()
  await expect(card.getByText(/Fresh|Pickup Soon|Urgent|Expired/i).first()).toBeVisible()

  const detailsHref = await card.locator('a[href^="/donation/"]').first().getAttribute('href')
  expect(detailsHref).toBeTruthy()

  await quickLogin(page, 'ngo')
  await expect(page.getByRole('heading', { name: /E2E Journey Curry/i }).first()).toBeVisible()
  await page.goto('/map')
  await expect(page.getByText(/E2E Journey Curry/i).first()).toBeVisible()

  await page.goto(detailsHref)
  await ensureLudhianaPlace(page)
  // contact hidden before accept for NGO
  await expect(page.getByText(/contact is revealed to the ngo that accepts the pickup/i)).toBeVisible()
  await expect(page.getByText(/9876543210/)).toHaveCount(0)

  await page.locator('main').getByRole('button', { name: /accept pickup|accept this pickup/i }).first().click()
  await expect(page.getByRole('button', { name: /mark as picked up|mark picked up/i })).toBeVisible()
  await expect(page.getByText(/9876543210/).first()).toBeVisible()

  // refresh mid-journey
  await page.reload()
  await expect(page.getByRole('button', { name: /mark as picked up|mark picked up/i })).toBeVisible()
  await expect(page.getByText(/9876543210/).first()).toBeVisible()

  await page.getByRole('button', { name: /mark as picked up|mark picked up/i }).click()
  await expect(page.getByRole('button', { name: /mark as distributed|mark distributed/i })).toBeVisible()
  await page.getByRole('button', { name: /mark as distributed|mark distributed/i }).click()
  await expect(page.getByText(/distributed/i).first()).toBeVisible()

  await page.goto('/impact')
  await expect(page.getByRole('main')).toBeVisible()
  const impactTextAfter = await page.getByRole('main').innerText()
  expect(impactTextAfter).not.toEqual(impactTextBefore)
})

test('expired listing hidden from NGOs, validation errors, two accepts, logout/back', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(({ donationsKey, seedAtKey, now }) => {
    const expired = {
      id: 'd-expired-e2e',
      foodName: 'Expired E2E Meal',
      quantity: 5,
      category: 'cooked',
      diet: 'veg',
      status: 'available',
      deadline: new Date(now - 60 * 60 * 1000).toISOString(),
      cookedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      donorId: 'u-donor-demo',
      donorName: 'Demo Donor',
      location: { lat: 30.901, lng: 75.8573 },
      address: 'Ludhiana',
      contactPhone: '9999999999',
      description: '',
      storage: 'room',
      photo: null,
      timeline: [{ status: 'available', at: new Date(now - 2 * 60 * 60 * 1000).toISOString() }],
      alertedNgoIds: [],
      reports: [],
      isSeed: false,
    }
    localStorage.setItem(donationsKey, JSON.stringify([expired]))
    localStorage.setItem(seedAtKey, String(now))
  }, { donationsKey: DONATIONS_KEY, seedAtKey: SEED_AT_KEY, now: Date.now() })
  await page.reload()

  await quickLogin(page, 'ngo')
  await expect(page.getByText(/Expired E2E Meal/i)).toHaveCount(0)

  // validation errors
  await quickLogin(page, 'donor')
  await page.goto('/donor/add')
  await expect(page.getByRole('heading', { name: /list surplus food/i })).toBeVisible()
  await page.locator('#food-name').fill('Bad Form Meal')
  // FRESH: Product rule specifies servings 1-10000. 500 is valid; 20000 is the out-of-range test value.
  await page.locator('#food-quantity').fill('20000') // out of range
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText(/servings must be between|servings must be a whole number/i)).toBeVisible()

  await page.locator('#food-quantity').fill('10')
  await page.getByRole('button', { name: /continue/i }).click()
  const now = Date.now()
  await page.locator('#food-cooked').fill(dtLocal(now - 10 * 60 * 1000))
  await page.locator('#food-deadline').fill(dtLocal(now - 30 * 60 * 1000)) // past deadline
  await page.locator('#food-phone').fill('123') // bad phone (rejected per product rule)
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText(/pickup deadline must be in the future|pickup deadline must be after/i).first()).toBeVisible()
  await expect(page.getByText(/at least 10 digits|valid .*phone|valid .*mobile/i)).toBeVisible()
  // FRESH: Product rule: valid Indian mobile (10 digits starting 6-9, optional +91 or 0 prefix) clears phone error
  await page.locator('#food-phone').fill('09876543210')
  await page.locator('#food-deadline').fill(dtLocal(now + 60 * 60 * 1000))
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText(/valid .*mobile|valid .*phone/i)).toHaveCount(0)

  // create two donations for two accepts in a row (clear previous broken inputs by fresh wizard flow)
  await fillDonationForm(page, { name: 'Accept Row A', qty: '12', deadlineOffsetMin: 180 })
  await fillDonationForm(page, { name: 'Accept Row B', qty: '14', deadlineOffsetMin: 200 })

  await quickLogin(page, 'ngo')
  for (const name of ['Accept Row A', 'Accept Row B']) {
    const card = page.locator('article', { has: page.getByRole('heading', { name: new RegExp(name, 'i') }) }).first()
    await expect(card).toBeVisible()
    await card.locator('a[href^="/donation/"]').first().click()
    await ensureLudhianaPlace(page)
    await page.locator('main').getByRole('button', { name: /accept pickup|accept this pickup/i }).first().click()
    await expect(page.getByText(/contact is revealed to the ngo that accepts the pickup/i)).toHaveCount(0)
    await page.goto('/ngo')
  }

  // logout and back
  await page.getByRole('button', { name: /sign out|log ?out/i }).click()
  await expect(page.getByRole('link', { name: /log in/i }).first()).toBeVisible()
  await page.goto('/ngo')
  await expect(page).toHaveURL(/\/login|\/$/)
})
