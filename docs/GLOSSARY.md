<!-- FRESH:FILE  Plain-English frontend glossary for the FRESH team. -->
<!-- FRESH:AREA  Layout -->

# Glossary (frontend)

- **Component** — A reusable piece of UI, written as a function that returns JSX. Example: `FoodCard` renders one listing card.
- **Hook** — A function starting with `use` that adds state or behaviour to a component. Example: `useRoute` fetches a road route.
- **Context** — React's way of sharing data with many components without passing props everywhere. Example: `LocationContext` shares the chosen place.
- **Props** — Inputs a component receives from its parent, like function arguments. Example: `<FoodCard donation={d} />`.
- **State** — Data a component remembers between renders; changing it re-renders the UI. Example: the open/closed state of a modal.
- **Effect** — Code that runs after render (`useEffect`) for things like fetching or timers. Example: `useRoute` fetches when endpoints change.
- **Route** — A URL path mapped to a page component by React Router. Example: `/map` renders `MapPage`.
- **Mock data** — Fictional data bundled in `src/data/` so the demo works without a backend; all files there are marked `SAMPLE DATA`.
- **Leaflet** — The map library that draws tiles, markers and circles. Example: `MapView` creates the map.
- **OSM (OpenStreetMap)** — The free map tiles and geocoder (Nominatim) the app uses. Example: the map background and pincode search.
- **OSRM** — The OpenStreetMap routing server used for pickup routes. Example: `src/services/routing.js` calls it.
- **Haversine** — The straight-line ("as the crow flies") distance formula used for radius filtering.
