import { CATEGORIES, CATEGORY_META, type Spot } from "@/data/spots";
import { formatMeters } from "@/lib/format";
import type { SpotFilter } from "./TrailApp";

interface Props {
  spots: Spot[];
  tourIds: string[];
  selectedId: string | null;
  filter: SpotFilter;
  query: string;
  favourites: string[];
  /** Walking distance from the user per spot id, when location is known. */
  distances: Map<string, number> | null;
  nearMe: boolean;
  locating: boolean;
  onFilter: (f: SpotFilter) => void;
  onQuery: (q: string) => void;
  onNearMe: () => void;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onFavourite: (id: string) => void;
}

export default function SpotList({
  spots,
  tourIds,
  selectedId,
  filter,
  query,
  favourites,
  distances,
  nearMe,
  locating,
  onFilter,
  onQuery,
  onNearMe,
  onSelect,
  onToggle,
  onFavourite,
}: Props) {
  const chips: { value: SpotFilter; label: string }[] = [
    { value: "all", label: "All spots" },
    { value: "favourites", label: `♥ Favourites (${favourites.length})` },
    ...CATEGORIES.map((c) => ({ value: c, label: `${CATEGORY_META[c].emoji} ${CATEGORY_META[c].label}` })),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-line p-4">
        <div className="flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search spots</span>
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search biryani, lassi, Lalbagh…"
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm placeholder:text-muted/80"
            />
          </label>
          <button
            type="button"
            onClick={onNearMe}
            aria-pressed={nearMe}
            title="Sort spots by distance from you"
            className={`shrink-0 rounded-xl border px-3 text-sm font-medium transition ${
              nearMe ? "border-[#2b6cb0] bg-[#2b6cb0] text-white" : "border-line bg-white hover:bg-paper-deep"
            }`}
          >
            {locating ? "Locating…" : "📍 Near me"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter spots">
          {chips.map(({ value, label }) => {
            const active = value === filter;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => onFilter(value)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink hover:bg-paper-deep"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto p-4">
        {spots.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
            {filter === "favourites"
              ? "No favourites yet — tap ♡ on any spot to save it here."
              : "Nothing matches that — try another dish or clear the filter."}
          </li>
        )}
        {spots.map((spot) => {
          const meta = CATEGORY_META[spot.category];
          const stop = tourIds.indexOf(spot.id) + 1;
          const selected = spot.id === selectedId;
          const fav = favourites.includes(spot.id);
          const away = distances?.get(spot.id);
          return (
            <li
              key={spot.id}
              className={`rounded-xl border bg-white p-3 shadow-sm transition ${
                selected ? "border-saffron ring-2 ring-saffron/40" : "border-line"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full text-base"
                  style={{ background: `${meta.color}22` }}
                >
                  {meta.emoji}
                </span>
                <button type="button" onClick={() => onSelect(spot.id)} className="min-w-0 flex-1 text-left">
                  <span className="block font-display text-[15px] font-semibold leading-tight">{spot.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {spot.area} · {spot.priceRange}
                  </span>
                  <span className="mt-1 block text-xs text-ink/80">{spot.famousFor}</span>
                  {away !== undefined && (
                    <span className="mt-1 inline-block rounded-full bg-[#2b6cb0]/10 px-2 py-0.5 text-[11px] font-medium text-[#2b6cb0]">
                      🚶 {formatMeters(away)} from you
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggle(spot.id)}
                    aria-label={stop ? `Remove ${spot.name} from trail` : `Add ${spot.name} to trail`}
                    className={`grid size-8 place-items-center rounded-full text-sm font-bold transition ${
                      stop
                        ? "bg-ink text-paper"
                        : "border border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
                    }`}
                  >
                    {stop || "+"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onFavourite(spot.id)}
                    aria-pressed={fav}
                    aria-label={fav ? `Remove ${spot.name} from favourites` : `Save ${spot.name} to favourites`}
                    className={`grid size-7 place-items-center rounded-full text-base transition hover:bg-paper-deep ${
                      fav ? "text-terracotta" : "text-muted"
                    }`}
                  >
                    {fav ? "♥" : "♡"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
