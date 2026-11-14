# FRESH – Food Reduction and Excess Sharing Hub

FRESH is a frontend-only hackathon demo that connects surplus food donors
(community kitchens, wedding halls, restaurants, event hosts and individuals)
with nearby verified NGOs. Donors list surplus food, NGOs discover it on a live
map and dashboard, accept a pickup, collect it and mark it distributed.

The platform is a **technology connector**. It does not prepare, store,
transport or inspect food, and it never guarantees that food is safe. The
receiving NGO makes the final inspection decision.

> All organisations, contact numbers, donations and photos are **sample data
> for demo**. No real food is listed.

---

## Tech stack

- React 18 + Vite (JavaScript, no TypeScript)
- Tailwind CSS v4 via `@tailwindcss/vite`
- React Router v6
- Leaflet + react-leaflet with OpenStreetMap tiles (no API keys)
- lucide-react icons
- State via React Context; persistence via `localStorage`
- No backend, no auth server, no chart library, no other UI libraries

---

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually <http://localhost:5173>).

Production check:

```bash
npm run build
npm run preview
```

Node 18+ is recommended.

---

## Demo script (end-to-end, about 2 minutes)

1. **Donor quick login** – open `/login` and click **Quick demo donor**.
   You land on the Spice Route Kitchen dashboard with seeded listings and live
   countdowns.
2. **Add a donation** – click **List surplus food** and fill the form:
   food name, category, veg/non-veg, servings, cooked-at time, storage, pickup
   deadline, address, contact phone. Optionally upload a photo and tap the map
   to set the pickup point. Click **Review & publish**.
3. **Accept the declaration** – tick the Food Donation Declaration and confirm.
   The donation detail page opens with a live countdown and the **Smart alert
   simulation** panel showing the three nearest verified NGOs and distances.
4. **Watch the escalation** – if no NGO accepts within the 60-second demo timer,
   the panel automatically adds the next three nearest verified NGOs and labels
   the second alert ring. You can speed this up by waiting, or keep the tab open
   while you switch roles.
5. **NGO quick login** – sign out, go to `/login` and click **Quick demo NGO**
   (Roti Bank Delhi). The NGO dashboard filters and sorts listings by urgency,
   then distance. Expired listings are hidden.
6. **Accept the pickup** – find the listing you created (search helps) and open
   its details, then click **Accept pickup**. The donor contact is revealed to
   the accepting NGO.
7. **Advance the lifecycle** – click **Mark picked up**, then
   **Mark distributed**. Toasts confirm each change; the status stepper and
   timeline update.
8. **Check the impact** – open **Impact** in the navbar. Meals saved, kg
   diverted, CO₂e avoided and completed donations have increased.
9. **Explore** – the **Map** page is role-aware (donors see verified NGOs, NGOs
   see urgency-coloured food markers plus their own base), and **Trust &
   safety** contains the declaration and platform-role wording.

Quick demo accounts:

| Role  | Email             | Notes                          |
|-------|-------------------|--------------------------------|
| Donor | `donor@fresh.demo`| Spice Route Kitchen, New Delhi |
| NGO   | `ngo@fresh.demo`  | Roti Bank Delhi (verified)     |

The login form is demo-only: any password is accepted; an account is matched by
email and role. You can also register a new donor or NGO from `/register`.

---

## Features

### Roles and auth
- Fake donor/NGO login and registration stored in Context + `localStorage`
- One-click quick demo login for each role
- Route guards for donor and NGO dashboards

### Donor
- Add donation form with validation: food name, category, diet, servings,
  cooked-at time, storage, pickup deadline, address, contact phone, notes
- Pickup point via a clickable Leaflet map or "Use my current location"
- Photo upload with instant object-URL preview, compressed before persistence
- Required Food Donation Declaration before publishing
- Dashboard with active/completed listings, live countdowns and status badges

### NGO
- Nearby listings with Haversine distance from the NGO's location
- Filters: distance, minimum servings, category, veg/non-veg
- Search by food or area; sorted by urgency and then distance
- Expired listings excluded from the NGO dashboard
- Accept pickup, then advance to Picked Up and Distributed
- Donor contact revealed only to the NGO that accepted the pickup
- Report unsafe food with a reason and comment

### Urgency (rule-based, not AI)
- **Fresh**: more than 2 hours to the deadline
- **Pickup Soon**: 30 minutes to 2 hours
- **Urgent**: under 30 minutes
- **Expired**: deadline passed (hidden from NGOs, visible to the donor)
- Colour + icon + text badges, a one-second countdown and a conservative
  category/storage safety hint
- Disclaimer shown throughout: *Urgency is guidance only. Final food safety
  verification rests with the donor and the receiving NGO.*
- A clearly labelled **AI Food Safety Assistant (coming soon)** teaser appears
  on the donor form and NGO dashboard. No AI output is faked.

### Smart alerts (differentiator)
- Publishing alerts the three nearest verified NGOs
- After 60 seconds without acceptance, the next three nearest verified NGOs are
  added automatically
- The escalation is visible on the donor's detail page with distances and
  first/second alert rings, plus a toast when it happens

### Map
- Full-screen Leaflet + OpenStreetMap map with no API key
- Donor/guest view: verified NGOs with name, focus, city, distance and phone
- NGO view: available donations colour-coded by urgency plus the NGO's base
- Marker popups link to donation details

### Impact
- Animated count-up stat cards: meals saved, kg food diverted, CO₂e avoided,
  active NGOs, donations completed
- Plain div/SVG bar chart and trend line (no chart library)
- Live additions from completed donations plus a seeded baseline
- Assumptions stated in the UI: **1 serving = 0.4 kg**, **1 kg food saved =
  2.5 kg CO₂e avoided**

### Trust and safety
- Verified badges on sample NGOs; registered NGOs show "verification pending"
- Donor declaration stored in the Terms page and required before publishing
- Report unsafe food modal
- Plain-language platform-role wording: FRESH connects; donors handle food
  responsibly; NGOs inspect before distributing
- No claim anywhere that food is guaranteed safe

### UX and accessibility
- Mobile-first responsive layout, rounded-2xl cards, soft shadows
- Emerald primary, warm orange accent, off-white background
- Labelled inputs, focus rings, `aria-label`s on icon buttons, live regions for
  countdowns/toasts, dialog semantics for modals
- Empty states, toasts, and a friendly 404 page
- Leaflet default-icon issue fixed for Vite by importing the bundled marker
  assets and using custom div-icon pins

---

## Persistence and resetting the demo

State is stored in `localStorage` under:

- `fresh_users_v1`
- `fresh_donations_v1`
- `fresh_current_user_v1`
- `fresh_seed_at_v1`

Seeded listings use times relative to "now" and are refreshed after six hours,
while donations created in the browser are kept.

To reset the demo completely, open DevTools → Application → Local Storage for
the site, clear those keys (or run `localStorage.clear()`) and refresh.

---

## Project structure

```text
src/
  components/  Navbar, Footer, FoodCard, UrgencyBadge, CountdownTimer, MapView,
               StatusStepper, StatCard, DeclarationModal, ReportModal, Toast,
               EmptyState
  pages/       Home, Login, Register, DonorDashboard, AddDonation, NGODashboard,
               MapPage, DonationDetail, ImpactDashboard, Terms
  context/     AppContext.jsx (users, donations, NGOs, actions, persistence)
  data/        mockNgos.js, mockDonations.js
  utils/       urgency.js, distance.js, format.js
  App.jsx, main.jsx, index.css
```

---

## Notes and limitations

- Frontend only: there is no server, real authentication, SMS/email alerting,
  image storage service or moderation backend.
- Smart alerts are a visible simulation; they do not send real notifications.
- The impact figures are demo estimates, not audited environmental claims.
- Data is sample data for demo and should not be treated as real food-safety
  information.
