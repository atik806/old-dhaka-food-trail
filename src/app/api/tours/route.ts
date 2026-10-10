import { SPOT_BY_ID } from "@/data/spots";
import { buildPlan } from "@/lib/planner";
import { saveTour } from "@/lib/tourStore";
import { createTourSchema, firstIssue } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createTourSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const tour = await saveTour(parsed.data.name, parsed.data.spotIds);
  const plan = buildPlan(tour.spotIds.map((id) => SPOT_BY_ID.get(id)!));
  return Response.json({ tour, plan }, { status: 201 });
}
