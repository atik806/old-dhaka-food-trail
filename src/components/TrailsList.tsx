import { useEffect, useState } from "react";
import { SPOT_BY_ID } from "@/data/spots";
import type { CuratedTrail } from "@/data/trails";
import { formatMeters, formatMinutes } from "@/lib/format";
import type { TourPlan } from "@/lib/planner";

type TrailWithTotals = CuratedTrail & { totals: TourPlan["totals"] };

interface Props {
  onLoad: (trail: CuratedTrail) => void;
}

export default function TrailsList({ onLoad }: Props) {
  const [trails, setTrails] = useState<TrailWithTotals[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trails")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Couldn't load trails"))))
      .then((data: { trails: TrailWithTotals[] }) => setTrails(data.trails))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="p-4 text-sm text-terracotta">{error}</p>;
  if (!trails) return <p className="p-4 text-sm text-muted">Loading trails…</p>;

  return (
    <ul className="h-full space-y-3 overflow-y-auto p-4">
      <li className="text-xs text-muted">
        Hand-picked walks. Load one, then tweak it — add, remove or reorder stops.
      </li>
      {trails.map((trail) => (
        <li key={trail.id} className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
          <div className="flex items-start gap-3">
            <span aria-hidden className="text-2xl leading-none">
              {trail.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-semibold leading-tight">{trail.name}</h3>
              <p className="mt-0.5 text-xs text-ink/80">{trail.tagline}</p>
            </div>
          </div>
          <ol className="mt-2.5 flex flex-wrap gap-1 text-[11px]">
            {trail.spotIds.map((id, i) => (
              <li key={id} className="rounded-full bg-paper-deep px-2 py-0.5">
                {i + 1}. {SPOT_BY_ID.get(id)?.name}
              </li>
            ))}
          </ol>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-muted">
              {trail.totals.stops} stops · ~{formatMeters(trail.totals.meters)} · {formatMinutes(trail.totals.totalMinutes)}
            </span>
            <button
              type="button"
              onClick={() => onLoad(trail)}
              className="shrink-0 rounded-lg bg-terracotta px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#9b3822]"
            >
              Load trail
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
