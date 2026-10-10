import type { Spot } from "@/data/spots";
import type { Leg } from "./planner";

export type OpenStatus = "open" | "closing-soon" | "not-open-yet" | "closed" | "closed-day";

export interface StopTime {
  spotId: string;
  /** Minutes since midnight of the start day (may exceed 1440 for late tours). */
  arrive: number;
  leave: number;
  /** 0 = Sunday … 6 = Saturday, the day of arrival. */
  day: number;
  status: OpenStatus;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}

function statusAt(spot: Spot, day: number, clock: number): OpenStatus {
  if (spot.closedDays?.includes(day)) return "closed-day";
  const open = toMinutes(spot.openTime);
  const close = toMinutes(spot.closeTime);
  if (clock < open) return "not-open-yet";
  if (clock >= close) return "closed";
  if (close - clock < spot.dwellMinutes) return "closing-soon";
  return "open";
}

/** Walks the tour from the start time: walk the leg into each stop, then spend its dwell time there. */
export function buildSchedule(spots: Spot[], legs: Leg[], startDay: number, startMinutes: number): StopTime[] {
  const legInto = new Map(legs.map((l) => [l.toId, l]));
  let t = startMinutes;
  return spots.map((spot) => {
    t += legInto.get(spot.id)?.minutes ?? 0;
    const arrive = t;
    const day = (startDay + Math.floor(arrive / 1440)) % 7;
    t += spot.dwellMinutes;
    return { spotId: spot.id, arrive, leave: t, day, status: statusAt(spot, day, arrive % 1440) };
  });
}

export function budget(spots: Spot[]): [number, number] {
  return spots.reduce<[number, number]>(([lo, hi], s) => [lo + s.costBdt[0], hi + s.costBdt[1]], [0, 0]);
}

export const STATUS_LABEL: Record<OpenStatus, string | null> = {
  open: null,
  "closing-soon": "Closes before you'd finish",
  "not-open-yet": "Not open yet when you arrive",
  closed: "Already closed when you arrive",
  "closed-day": "Closed on this day",
};
