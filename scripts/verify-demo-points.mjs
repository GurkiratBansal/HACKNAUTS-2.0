/**
 * verify-demo-points.mjs
 * 
 * For each point in the Ludhiana demo data, call OSRM's nearest endpoint
 * and print snapped coordinates + distance moved. Flag any point that
 * moves more than 300 m or returns no result.
 * 
 * Run with: node scripts/verify-demo-points.mjs
 * 
 * If the network is blocked in your environment, say so and leave the
 * script for the reviewer to run manually.
 */

import fs from 'node:fs';
import { haversineKm } from '../src/utils/distance.js';
import demoLudhiana from '../src/data/demoLudhiana.js';

async function main() {
  const points = demoLudhiana;
  console.log(`Checking ${points.length} demo points against OSRM nearest endpoint...\n`);

  const results = [];

  for (const entry of points) {
    const { lat, lng, name } = entry;
    const url = `https://routing.openstreetmap.de/routed-car/nearest/v1/driving/${lng},${lat}`;

    let response;
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      response = await res.json();
    } catch (e) {
      results.push({
        name,
        ok: false,
        error: e.message || 'Fetch failed',
        snappedLat: null,
        snappedLng: null,
        distanceMoved: null,
      });
      console.log(`✗ ${name}: ${e.message}`);
      continue;
    }

    const snapped = response.waypoints?.[0]?.location || response.geometry?.coordinates
    if (!snapped) {
      results.push({
        name,
        ok: false,
        error: 'No geometry returned',
        snappedLat: null,
        snappedLng: null,
        distanceMoved: null,
      });
      console.log(`✗ ${name}: no geometry returned`);
      continue;
    }

    const [snappedLng, snappedLat] = snapped; // OSRM: [lng, lat]
    const originalLat = lat;
    const originalLng = lng;
    const distanceMoved = haversineKm(
      { lat: originalLat, lng: originalLng },
      { lat: snappedLat, lng: snappedLng },
    );

    const ok = distanceMoved <= 300; // flag if moved > 300 m
    results.push({
      name,
      ok,
      error: ok ? null : `Moved ${distanceMoved.toFixed(1)} m outside 300 m tolerance`,
      snappedLat,
      snappedLng,
      distanceMoved: Number(distanceMoved.toFixed(1)),
    });

    const marker = ok ? '✓' : '✗';
    console.log(`${marker} ${name}: snapped (${snappedLat.toFixed(4)}, ${snappedLng.toFixed(4)}), moved ${distanceMoved.toFixed(1)} m${ok ? '' : ' (EXCEEDED)'}`);
  }

  // Summary
  const total = results.length;
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  const noResult = results.filter(r => r.distanceMoved === null).length;

  console.log(`\nSummary: ${passed}/${total} passed, ${failed} failed, ${noResult} no result`);

  // Write results to a JSON file next to the script.
  const outPath = 'scripts/demo-snapped-results.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Results written to ${outPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
