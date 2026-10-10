import { SPOT_BY_ID } from "@/data/spots";
import { buildPlan, optimizeOrder } from "@/lib/planner";
import { fetchStreetRoute } from "@/lib/streetRoute";
import { firstIssue, routePlanSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = routePlanSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { spotIds, optimize, origin } = parsed.data;
  const spots = spotIds.map((id) => SPOT_BY_ID.get(id)!);
  const ordered = optimize ? optimizeOrder(spots, origin) : spots;

  // Real lane-level distances when the routing service answers; straight-line estimates otherwise.
  const street = await fetchStreetRoute(origin ? [origin, ...ordered] : ordered);
  return Response.json({ plan: buildPlan(ordered, origin, street) });
}
