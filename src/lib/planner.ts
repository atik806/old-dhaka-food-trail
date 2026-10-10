import type { Spot } from "@/data/spots";
import { walkingMeters, walkingMinutes, type LatLng } from "./geo";
import type { StreetRoute } from "./streetRoute";

/** Leg endpoint id used for the walker's own starting position. */
export const ORIGIN_ID = "origin";

export interface Leg {
  fromId: string;
  toId: string;
  meters: number;
  minutes: number;
}

export interface TourPlan {
  spotIds: string[];
  origin: LatLng | null;
  legs: Leg[];
  totals: {
    stops: number;
    meters: number;
    walkMinutes: number;
    dwellMinutes: number;
    totalMinutes: number;
  };
  /** Street-following line as [lat, lng] pairs, or null when only estimates are available. */
  geometry: [number, number][] | null;
  source: "streets" | "estimate";
}

type Point = LatLng & { id: string };

const withOrigin = (spots: Spot[], origin: LatLng | null): Point[] =>
  origin ? [{ id: ORIGIN_ID, lat: origin.lat, lng: origin.lng }, ...spots] : spots;

export function buildPlan(spots: Spot[], origin: LatLng | null = null, street: StreetRoute | null = null): TourPlan {
  const points = withOrigin(spots, origin);
  const legs: Leg[] = [];
  for (let i = 1; i < points.length; i++) {
    const meters = street?.legMeters[i - 1] ?? walkingMeters(points[i - 1], points[i]);
    legs.push({
      fromId: points[i - 1].id,
      toId: points[i].id,
      meters: Math.round(meters),
      minutes: Math.round(walkingMinutes(meters)),
    });
  }
  const meters = legs.reduce((sum, l) => sum + l.meters, 0);
  const walkMinutes = Math.round(walkingMinutes(meters));
  const dwellMinutes = spots.reduce((sum, s) => sum + s.dwellMinutes, 0);
  return {
    spotIds: spots.map((s) => s.id),
    origin,
    legs,
    totals: {
      stops: spots.length,
      meters,
      walkMinutes,
      dwellMinutes,
      totalMinutes: walkMinutes + dwellMinutes,
    },
    geometry: street?.geometry ?? null,
    source: street ? "streets" : "estimate",
  };
}

function pathLength(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += walkingMeters(path[i - 1], path[i]);
  return total;
}

/**
 * Shortest-ish open walking path. The walker's origin (if given) is the fixed start;
 * otherwise the first stop is. Nearest-neighbour seed, then 2-opt until no segment
 * reversal helps.
 */
export function optimizeOrder(spots: Spot[], origin: LatLng | null = null): Spot[] {
  const points = withOrigin(spots, origin);
  if (points.length <= 2) return [...spots];

  const remaining = points.slice(1);
  const path: Point[] = [points[0]];
  while (remaining.length) {
    const last = path[path.length - 1];
    let best = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (walkingMeters(last, remaining[i]) < walkingMeters(last, remaining[best])) best = i;
    }
    path.push(remaining.splice(best, 1)[0]);
  }

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < path.length - 1; i++) {
      for (let k = i + 1; k < path.length; k++) {
        const candidate = [...path.slice(0, i), ...path.slice(i, k + 1).reverse(), ...path.slice(k + 1)];
        if (pathLength(candidate) + 1e-6 < pathLength(path)) {
          path.splice(0, path.length, ...candidate);
          improved = true;
        }
      }
    }
  }
  return (origin ? path.slice(1) : path) as Spot[];
}
