<!-- FRESH:FILE  Frontend folder and responsibility map. -->
<!-- FRESH:AREA  Layout -->

# FRESH frontend code map

Every file in `src/` starts with two searchable comment lines:

```js
// FRESH:FILE  <what this file does>
// FRESH:AREA  <Map | Location | Routing | Donations | Emergency | Auth | Impact | Layout | Utils | Data | API>
```

Find things with:

```bash
grep -rn "FRESH:LOCATION" src
grep -rn "WATCH OUT" src
grep -rn "SAMPLE DATA" src
```

## Folders and files

| Path | Area | What it does |
|---|---|---|
| `src/main.jsx` | Layout | Boots React, mounts all providers, renders `<App/>`. |
| `src/App.jsx` | Layout | Route table plus shared shell (navbar, emergency banner, relief meter, footer, toasts). |
| `src/config.js` | Utils | Shared constants: OSRM endpoints, radius options, emergency flags, storage keys. |
| `src/index.css` | Layout | Tailwind theme, custom colors, lite-mode and reduced-motion rules (not tagged: CSS). |
| `src/context/LocationContext.jsx` | Location | Active place. Priority: saved place → GPS (only if already permitted) → picker. India-only. |
| `src/context/AppContext.jsx` | Donations | Demo users, donations, NGOs, auth and the donation lifecycle; localStorage-backed. |
| `src/context/EmergencyContext.jsx` | Emergency | Active alert (state-matched, expiry-checked), simulator, concern reports, relief needs. |
| `src/context/LiteModeContext.jsx` | Layout | Lite-mode toggle persisted in localStorage; toggles a class on `<html>`. |
| `src/hooks/useRoute.js` | Routing | Loads one road route, aborts on change/unmount. |
| `src/hooks/useGeolocation.js` | Location | Continuous GPS watch wrapper. |
| `src/hooks/useTheme.js` | Layout | Shared dark/light theme state. |
| `src/hooks/useCountUp.js` | Impact | Count-up animation that respects reduced motion. |
| `src/hooks/useInView.js` | Layout | Fires once when an element scrolls into view. |
| `src/services/routing.js` | Routing | OSRM client: `{ coords [[lat,lng]…], distanceKm, durationMin }`. |
| `src/services/geocode.js` | Location | Nominatim/Photon geocoding (reverse, pincode, text), India-only, cached. |
| `src/services/alertsFeed.js` | Emergency | Optional SACHET RSS fetch; disabled (CORS). |
| `src/utils/urgency.js` | Donations | Urgency ladder: fresh >2h, soon 30m–2h, urgent <30m, expired. |
| `src/utils/distance.js` | Utils | Haversine km, sorting, nearest NGOs. |
| `src/utils/nearby.js` | Map | Radius filter with bounding-box prefilter; recommendations. |
| `src/utils/locationGate.js` | Location | India-only gate; fails closed when the country cannot be confirmed. |
| `src/utils/india.js` | Utils | State list, pincode/phone validators, India bounding box. |
| `src/utils/format.js` | Utils | en-IN formatting: dates, numbers, distance, countdown, labels. |
| `src/utils/sample.js` | Data | Generates sample NGOs/kitchens/donations around the active place. |
| `src/utils/hazards.js` | Emergency | Route-vs-hazard-circle check. |
| `src/data/*` | Data | SAMPLE DATA: mock NGOs, donations, Ludhiana demo pack, hazard zones, relief needs. |
| `src/components/MapView.jsx` | Map | Leaflet map wrapper shared by map and detail pages. |
| `src/components/map/*` | Map | Map page building blocks: panel, filters, results, legends, recenter, mobile sheet. |
| `src/components/RouteLayer.jsx` | Routing | Draws the route polyline. |
| `src/components/RouteSummary.jsx` | Routing | Distance/ETA with hazard warning. |
| `src/components/HazardLayer.jsx` | Emergency | Draws hazard circles. |
| `src/components/EmergencyBanner.jsx` | Emergency | State-matched alert banner with concern form. |
| `src/components/EmergencySimulator.jsx` | Emergency | Demo control to trigger a simulated alert. |
| `src/components/NeedsBoard.jsx` | Emergency | Relief needs list with pledge progress. |
| `src/components/ReliefMeter.jsx` | Emergency | Slim pledged-relief meter. |
| `src/components/ReliefTag.jsx` | Emergency | Relief-relevant tag on listings. |
| `src/components/FoodCard.jsx` | Donations | Listing card with urgency and distance. |
| `src/components/UrgencyBadge.jsx` | Donations | Urgency-colored badge. |
| `src/components/CountdownTimer.jsx` | Donations | Live deadline countdown. |
| `src/components/StatusStepper.jsx` | Donations | available → accepted → picked_up → distributed stepper. |
| `src/components/ReportModal.jsx` | Donations | Safety-report modal. |
| `src/components/DeclarationModal.jsx` | Donations | Food-safety declaration before publishing. |
| `src/components/LocationBar.jsx` | Location | Header control showing the active place. |
| `src/components/LocationPicker.jsx` | Location | Search/picker modal (area, pincode, GPS). |
| `src/components/LocationPickerHost.jsx` | Location | Renders the picker when opened. |
| `src/components/donation/*` | Donations | Donation wizard steps, nav and validators. |
| `src/components/detail/*` | Donations | Detail page hero, aside, alert panel, pickup map. |
| `src/components/dashboard/*` | Donations | Dashboard shell, tiles, NGO panels. |
| `src/components/home/*` | Layout | Landing sections (impact band and SDG grid are Impact). |
| `src/components/ui/*` | Layout | Button, Field, Modal, SmartImage primitives. |
| `src/components/Toast.jsx` | Layout | Transient messages. |
| `src/components/ErrorBoundary.jsx` | Layout | Render-error recovery screen. |
| `src/components/ThemeToggle.jsx` | Layout | Dark/light toggle. |
| `src/components/LiteModeToggle.jsx` | Layout | Lite-mode toggle. |
| `src/pages/Home.jsx` | Layout | Landing page. |
| `src/pages/Login.jsx` / `Register.jsx` | Auth | Demo login and registration. |
| `src/pages/DonorDashboard.jsx` | Donations | Donor listings and statuses. |
| `src/pages/NGODashboard.jsx` | Donations | NGO queue, accepted pickups, needs board. |
| `src/pages/AddDonation.jsx` | Donations | Donation wizard page. |
| `src/pages/MapPage.jsx` | Map | Map page with filters, results and demo routing. |
| `src/pages/DonationDetail.jsx` | Donations | Detail page with timeline and actions. |
| `src/pages/ImpactDashboard.jsx` | Impact | Impact totals. |
| `src/pages/Terms.jsx` | Layout | Terms and safety notes. |
| `src/test/setup.js` | Utils | Vitest setup; leaflet stubbed for jsdom. |
| `e2e/journey.spec.js` | — | Playwright demo journey (outside `src/`, not tagged). |

## "If you want to change X, look in Y"

| Task | Look in |
|---|---|
| Change urgency rules or thresholds | `src/utils/urgency.js` (and `EMERGENCY_URGENCY_FACTOR` in `src/config.js`). |
| Change the default/allowed search radius | `RADIUS_OPTIONS` / `DEFAULT_RADIUS_KM` in `src/config.js`, used by `src/utils/nearby.js`. |
| Change the saved-place → GPS → picker priority | `src/context/LocationContext.jsx` (startup `useEffect`). |
| Change how routes are fetched or parsed | `src/services/routing.js` + `ROUTING_BASE_URLS` in `src/config.js`. |
| Change who can accept or advance a donation | `acceptDonation` / `advanceStatus` in `src/context/AppContext.jsx`. |
| Change emergency activation rules (state match/expiry) | `isEmergencyActive` in `src/context/EmergencyContext.jsx`. |
| Change the emergency simulator behaviour | `simulate` in `src/context/EmergencyContext.jsx` + `src/components/EmergencySimulator.jsx`. |
| Change sample (mock) data | `src/data/*` and `src/utils/sample.js` — all marked `SAMPLE DATA`. |
| Change India-only validation | `src/utils/india.js`, `src/utils/locationGate.js`, `ENFORCE_INDIA_ONLY` in `src/config.js`. |
| Change map filters or radius UI | `src/components/map/MapFilters.jsx` and `src/pages/MapPage.jsx`. |
