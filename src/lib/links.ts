import type { LatLng } from "./geo";

/** Google Maps accepts at most 9 intermediate waypoints in a directions URL. */
const MAX_WAYPOINTS = 9;

/**
 * Google Maps walking-directions link through the given points in order.
 * Long tours are cut to origin + 9 waypoints + destination; `truncated` says so.
 */
export function googleMapsDirections(points: LatLng[]): { url: string; truncated: boolean } | null {
  if (points.length < 2) return null;
  const truncated = points.length > MAX_WAYPOINTS + 2;
  const used = truncated ? points.slice(0, MAX_WAYPOINTS + 2) : points;
  const fmt = (p: LatLng) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
  const params = new URLSearchParams({
    api: "1",
    travelmode: "walking",
    origin: fmt(used[0]),
    destination: fmt(used[used.length - 1]),
  });
  const waypoints = used.slice(1, -1).map(fmt).join("|");
  if (waypoints) params.set("waypoints", waypoints);
  return { url: `https://www.google.com/maps/dir/?${params}`, truncated };
}
