import type { NextRequest } from "next/server";
import { CATEGORIES, SPOTS, type Category } from "@/data/spots";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();

  if (category && !CATEGORIES.includes(category as Category)) {
    return Response.json({ error: "Unknown category" }, { status: 400 });
  }

  const spots = SPOTS.filter(
    (s) =>
      (!category || s.category === category) &&
      (!q ||
        [s.name, s.nameBn, s.area, s.famousFor, ...s.mustTry].some((f) =>
          f.toLowerCase().includes(q),
        )),
  );
  return Response.json({ spots });
}
