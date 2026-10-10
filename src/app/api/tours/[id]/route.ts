import { SPOT_BY_ID } from "@/data/spots";
import { buildPlan } from "@/lib/planner";
import { getTour } from "@/lib/tourStore";

export async function GET(_req: Request, ctx: RouteContext<"/api/tours/[id]">) {
  const { id } = await ctx.params;
  const tour = await getTour(id);
  if (!tour) return Response.json({ error: "Tour not found" }, { status: 404 });

  // Drop stops whose spot was removed from the dataset since the tour was saved.
  const spots = tour.spotIds.flatMap((sid) => SPOT_BY_ID.get(sid) ?? []);
  return Response.json({ tour: { ...tour, spotIds: spots.map((s) => s.id) }, plan: buildPlan(spots) });
}
