import { SPOT_BY_ID } from "@/data/spots";

export async function GET(_req: Request, ctx: RouteContext<"/api/spots/[id]">) {
  const { id } = await ctx.params;
  const spot = SPOT_BY_ID.get(id);
  if (!spot) return Response.json({ error: "Spot not found" }, { status: 404 });
  return Response.json({ spot });
}
