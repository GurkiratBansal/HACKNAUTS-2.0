import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom has no real layout; keep leaflet from touching it during tests.
vi.mock('leaflet', () => ({
  default: {
    map: () => ({ remove: () => {} }),
    tileLayer: () => ({ addTo: () => {} }),
  },
}))
