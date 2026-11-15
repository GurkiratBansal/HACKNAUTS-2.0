// FRESH:FILE  Vitest setup: jest-dom matchers plus a leaflet stub so map components render in jsdom.
// FRESH:AREA  Utils

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// FRESH:Utils  jsdom has no layout; keep leaflet from touching it during tests.
// jsdom has no real layout; keep leaflet from touching it during tests.
vi.mock('leaflet', () => ({
  default: {
    map: () => ({ remove: () => {} }),
    tileLayer: () => ({ addTo: () => {} }),
  },
}))
