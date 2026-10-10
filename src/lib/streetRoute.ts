import type { LatLng } from "./geo";

export interface StreetRoute {
  /** Walking distance in metres for each consecutive pair of points. */
  legMeters: number[];
  /** Street-following polyline as [lat, lng] pairs. */
  geometry: [number, number][];
}

// FOSSGIS's public OSRM instance with a pedestrian profile (the path segment says
// "driving" but the routed-foot host routes for walking). Override for self-hosting.
const OSRM_URL = process.env.OSRM_FOOT_URL ?? "https://routing.openstreetmap.de/routed-foot/route/v1/driving";
const TIMEOUT_MS = 4000;
const CACHE_LIMIT = 300;

const cache = new Map<string, StreetRoute>();

interface OsrmResponse {
  code: string;
  routes?: { legs: { distance: number }[]; geometry: { coordinates: [number, number][] } }[];
}

/**
 * Real walking route through the lanes. Returns null (caller falls back to
 * straight-line estimates) if the routing service is slow, down or can't route.
 */
export async function fetchStreetRoute(points: LatLng[]): Promise<StreetRoute | null> {
  if (points.length < 2) return null;
  const coords = points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
  const hit = cache.get(coords);
  if (hit) return hit;

  try {
    const res = await fetch(`${OSRM_URL}/${coords}?overview=full&geometries=geojson`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "OldDhakaFoodTrail/0.2 (hobby project)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OsrmResponse;
    const route = data.code === "Ok" ? data.routes?.[0] : undefined;
    if (!route || route.legs.length !== points.length - 1) return null;

    const result: StreetRoute = {
      legMeters: route.legs.map((l) => l.distance),
      geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
    cache.set(coords, result);
    return result;
  } catch {
    return null;
  }
}
