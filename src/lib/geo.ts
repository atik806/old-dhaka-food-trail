export interface LatLng {
  lat: number;
  lng: number;
}

/** Old Dhaka lanes twist; straight-line distance under-estimates the real walk. */
export const STREET_FACTOR = 1.35;
export const WALK_SPEED_KMH = 4;

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function walkingMeters(a: LatLng, b: LatLng): number {
  return haversineMeters(a, b) * STREET_FACTOR;
}

export function walkingMinutes(meters: number): number {
  return (meters / 1000 / WALK_SPEED_KMH) * 60;
}
