import { test, expect } from '@playwright/test'

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
    const failure = request.failure()?.errorText || 'request failed'
    const text = `${failure} ${url}`
    if (isNetworkDependent(text) || /openstreetmap|osrm/i.test(url)) {
      networkDependent.push(text)
    }
  })

  page.__freshTestErrors = { consoleErrors, pageErrors, networkDependent }
})

test.afterEach(async ({ page }, testInfo) => {
  const { consoleErrors = [], pageErrors = [], networkDependent = [] } = page.__freshTestErrors || {}

  if (networkDependent.length) {
    await testInfo.attach('network-dependent', {
      body: networkDependent.join('\n'),
      contentType: 'text/plain',
    })
  }

  expect(
    [...consoleErrors, ...pageErrors],
    [
      'Console/page errors detected:',
      ...consoleErrors.map((e) => `console: ${e}`),
      ...pageErrors.map((e) => `pageerror: ${e}`),
      networkDependent.length ? `network-dependent (ignored):\n${networkDependent.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  ).toEqual([])
})

test('smoke: home renders and main navigation is usable', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /FRESH/i }).first()).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('link', { name: /Log in/i }).first()).toBeVisible()
})
