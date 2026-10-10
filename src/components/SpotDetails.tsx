import { CATEGORY_META, type Spot } from "@/data/spots";
import { formatMeters, formatTaka } from "@/lib/format";

interface Props {
  spot: Spot;
  stopNumber: number;
  favourite: boolean;
  distanceFromUser?: number;
  onToggle: () => void;
  onFavourite: () => void;
}

export default function SpotDetails({ spot, stopNumber, favourite, distanceFromUser, onToggle, onFavourite }: Props) {
  const meta = CATEGORY_META[spot.category];
  const inTour = stopNumber > 0;
  return (
    <div className="space-y-2 text-[13px] leading-snug">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
            style={{ background: meta.color }}
          >
            {meta.emoji} {meta.label}
          </span>
          <button
            type="button"
            onClick={onFavourite}
            aria-pressed={favourite}
            aria-label={favourite ? "Remove from favourites" : "Save to favourites"}
            className={`text-lg leading-none ${favourite ? "text-terracotta" : "text-muted hover:text-terracotta"}`}
          >
            {favourite ? "♥" : "♡"}
          </button>
        </div>
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-tight">{spot.name}</h3>
        <p className="text-muted">
          {spot.nameBn} · {spot.area}
        </p>
      </div>
      <p className="font-medium text-terracotta">{spot.famousFor}</p>
      <p>{spot.description}</p>
      <p>
        <span className="font-semibold">Must try:</span> {spot.mustTry.join(", ")}
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted">
        <span>
          {formatTaka(spot.costBdt[0])}–{spot.costBdt[1]} pp
        </span>
        <span>🕒 {spot.hours}</span>
        <span>~{spot.dwellMinutes} min here</span>
        {distanceFromUser !== undefined && <span>🚶 {formatMeters(distanceFromUser)} from you</span>}
      </div>
      <p className="rounded-lg bg-paper-deep px-2.5 py-1.5 text-[12px]">💡 {spot.tips}</p>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition ${
          inTour
            ? "border border-line bg-white text-ink hover:bg-paper-deep"
            : "bg-terracotta text-white hover:bg-[#9b3822]"
        }`}
      >
        {inTour ? `Remove stop #${stopNumber}` : "Add to my trail"}
      </button>
    </div>
  );
}
