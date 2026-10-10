import { z } from "zod";
import { OLD_DHAKA_CENTER, SPOT_BY_ID } from "@/data/spots";
import { haversineMeters } from "./geo";

export const MAX_STOPS = 12;

export const spotIdsSchema = z
  .array(z.string())
  .max(MAX_STOPS, `A tour can have at most ${MAX_STOPS} stops`)
  .refine((ids) => new Set(ids).size === ids.length, "Each spot can appear only once")
  .refine((ids) => ids.every((id) => SPOT_BY_ID.has(id)), "Unknown spot id");

/** A GPS start further than this from Old Dhaka isn't a walkable starting point. */
export const MAX_ORIGIN_METERS = 8000;

export const originSchema = z
  .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
  .refine(
    (p) => haversineMeters(p, { lat: OLD_DHAKA_CENTER[0], lng: OLD_DHAKA_CENTER[1] }) <= MAX_ORIGIN_METERS,
    "Your starting point is too far from Old Dhaka to walk",
  );

export const routePlanSchema = z.object({
  spotIds: spotIdsSchema,
  optimize: z.boolean().optional().default(false),
  origin: originSchema.nullable().optional().default(null),
});

export const createTourSchema = z.object({
  name: z.string().trim().min(1, "Give your tour a name").max(60, "Name is too long"),
  spotIds: spotIdsSchema.refine((ids) => ids.length >= 1, "Add at least one stop"),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
