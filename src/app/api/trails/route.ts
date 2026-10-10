import { SPOT_BY_ID } from "@/data/spots";
import { TRAILS } from "@/data/trails";
import { buildPlan } from "@/lib/planner";

export async function GET() {
  const trails = TRAILS.map((t) => {
    const { totals } = buildPlan(t.spotIds.map((id) => SPOT_BY_ID.get(id)!));
    return { ...t, totals };
  });
  return Response.json({ trails });
}
