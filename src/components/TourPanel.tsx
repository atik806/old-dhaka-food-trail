import { CATEGORY_META, SPOT_BY_ID } from "@/data/spots";
import { formatMeters, formatMinutes, formatTaka } from "@/lib/format";
import { ORIGIN_ID, type TourPlan } from "@/lib/planner";
import { DAY_NAMES, STATUS_LABEL, formatClock, type StopTime } from "@/lib/schedule";
import { MAX_STOPS } from "@/lib/validation";

interface Props {
  tourIds: string[];
  tourName: string;
  plan: TourPlan | null;
  schedule: StopTime[] | null;
  budget: [number, number];
  startDay: number;
  startTime: string;
  startFromMe: boolean;
  /** Why "start from my location" is unavailable, or null when it can be used. */
  originBlocker: string | null;
  mapsLink: { url: string; truncated: boolean } | null;
  busy: "optimize" | "save" | null;
  shareUrl: string | null;
  error: string | null;
  onName: (name: string) => void;
  onStartDay: (day: number) => void;
  onStartTime: (time: string) => void;
  onStartFromMe: (on: boolean) => void;
  onMove: (index: number, delta: -1 | 1) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onOptimize: () => void;
  onSave: () => void;
  onClear: () => void;
}

export default function TourPanel(props: Props) {
  const { tourIds, tourName, plan, schedule, budget, busy, shareUrl, error, mapsLink } = props;

  if (tourIds.length === 0) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div className="max-w-64 space-y-2">
          <p className="text-3xl" aria-hidden>
            🗺️
          </p>
          <h2 className="font-display text-lg font-semibold">Your trail is empty</h2>
          <p className="text-sm text-muted">
            Add a few spots — say Nanna Biryani, a warm bakarkhani and Lalbagh Fort — or load one of the
            ready-made trails, and we&apos;ll draw the walk between them.
          </p>
        </div>
      </div>
    );
  }

  const legInto = new Map(plan?.legs.map((l) => [l.toId, l]));
  const timeById = new Map(schedule?.map((s) => [s.spotId, s]));
  const warnings = schedule?.filter((s) => s.status !== "open").length ?? 0;
  const finish = schedule?.at(-1)?.leave;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-line p-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Trail name</span>
          <input
            value={tourName}
            onChange={(e) => props.onName(e.target.value)}
            maxLength={60}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-display text-base font-semibold"
          />
        </label>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <label className="block">
            <span className="sr-only">Day of the walk</span>
            <select
              value={props.startDay}
              onChange={(e) => props.onStartDay(Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
            >
              {DAY_NAMES.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <span className="text-muted">start</span>
            <input
              type="time"
              value={props.startTime}
              onChange={(e) => e.target.value && props.onStartTime(e.target.value)}
              className="rounded-lg border border-line bg-white px-2 py-1 text-sm"
            />
          </label>
        </div>

        <label
          className={`flex items-start gap-2 text-xs ${props.originBlocker ? "text-muted" : "text-ink"}`}
          title={props.originBlocker ?? undefined}
        >
          <input
            type="checkbox"
            checked={props.startFromMe && !props.originBlocker}
            disabled={!!props.originBlocker}
            onChange={(e) => props.onStartFromMe(e.target.checked)}
            className="mt-0.5 accent-[#2b6cb0]"
          />
          <span>
            Start the walk from my location
            {props.originBlocker && <span className="block text-[11px]">{props.originBlocker}</span>}
          </span>
        </label>

        <dl className="grid grid-cols-4 gap-2 text-center">
          {[
            ["Stops", `${tourIds.length}/${MAX_STOPS}`],
            ["Walk", plan ? formatMeters(plan.totals.meters) : "…"],
            ["Total", plan ? formatMinutes(plan.totals.totalMinutes) : "…"],
            ["Finish", finish !== undefined ? formatClock(finish) : "…"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-paper-deep px-1 py-2">
              <dt className="text-[10px] uppercase tracking-wide text-muted">{label}</dt>
              <dd className="text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="flex flex-wrap justify-between gap-x-2 text-xs text-muted">
          <span>
            💰 <span className="font-semibold text-ink">{formatTaka(budget[0])}–{formatTaka(budget[1])}</span> per person
          </span>
          {plan && (
            <span title={plan.source === "streets" ? "Measured along real streets" : "Routing service unavailable"}>
              {plan.source === "streets" ? "🛣️ Real street distances" : "📏 Estimated distances"}
            </span>
          )}
        </p>
        {warnings > 0 && (
          <p className="rounded-lg bg-saffron/15 px-3 py-1.5 text-xs text-[#8a5a00]">
            ⚠️ {warnings} stop{warnings > 1 ? "s" : ""} may be closed when you get there — try another start time or
            reorder.
          </p>
        )}
      </div>

      <ol className="flex-1 overflow-y-auto p-4">
        {tourIds.map((id, i) => {
          const spot = SPOT_BY_ID.get(id);
          if (!spot) return null;
          const leg = legInto.get(id);
          const time = timeById.get(id);
          const warning = time && STATUS_LABEL[time.status];
          return (
            <li key={id}>
              {(i > 0 || leg?.fromId === ORIGIN_ID) && (
                <p className="my-1 ml-5 border-l-2 border-dashed border-terracotta/50 py-1.5 pl-4 text-xs text-muted">
                  {leg
                    ? `${leg.fromId === ORIGIN_ID ? "📍 From you · " : "🚶 "}${formatMeters(leg.meters)} · ${formatMinutes(Math.max(leg.minutes, 1))} walk`
                    : "…"}
                </p>
              )}
              <div
                className={`rounded-xl border bg-white p-2.5 shadow-sm ${warning ? "border-saffron" : "border-line"}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ background: CATEGORY_META[spot.category].color }}
                  >
                    {i + 1}
                  </span>
                  <button type="button" onClick={() => props.onSelect(id)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-semibold">{spot.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {time ? `${formatClock(time.arrive)} – ${formatClock(time.leave)}` : `~${spot.dwellMinutes} min`} ·{" "}
                      {formatTaka(spot.costBdt[0])}–{spot.costBdt[1]}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center">
                    <IconButton label={`Move ${spot.name} up`} disabled={i === 0} onClick={() => props.onMove(i, -1)}>
                      ▲
                    </IconButton>
                    <IconButton
                      label={`Move ${spot.name} down`}
                      disabled={i === tourIds.length - 1}
                      onClick={() => props.onMove(i, 1)}
                    >
                      ▼
                    </IconButton>
                    <IconButton label={`Remove ${spot.name}`} onClick={() => props.onRemove(id)}>
                      ✕
                    </IconButton>
                  </div>
                </div>
                {warning && (
                  <p className="mt-1.5 rounded-md bg-saffron/15 px-2 py-1 text-[11px] text-[#8a5a00]">
                    ⚠️ {warning} · hours {spot.hours}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="space-y-2 border-t border-line bg-paper p-4">
        {error && (
          <p role="alert" className="rounded-lg bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
            {error}
          </p>
        )}
        {shareUrl && (
          <p className="rounded-lg bg-mughal/10 px-3 py-2 text-xs text-mughal">
            Link copied! <span className="break-all font-mono">{shareUrl}</span>
          </p>
        )}
        {mapsLink && (
          <a
            href={mapsLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-line bg-white px-3 py-2 text-center text-sm font-semibold transition hover:bg-paper-deep"
            title={mapsLink.truncated ? "Google Maps allows 11 points — the last stops are left off" : undefined}
          >
            🧭 Walk it in Google Maps{mapsLink.truncated ? " (first 11 points)" : ""}
          </a>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={props.onOptimize}
            disabled={tourIds.length < 2 || busy !== null}
            title={tourIds.length < 2 ? "Add at least 2 stops to optimise" : undefined}
            className="rounded-xl border border-ink px-3 py-2 text-sm font-semibold transition hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            {busy === "optimize" ? "Optimising…" : "✨ Optimise route"}
          </button>
          <button
            type="button"
            onClick={props.onSave}
            disabled={busy !== null || !tourName.trim()}
            className="rounded-xl bg-terracotta px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#9b3822] disabled:opacity-50"
          >
            {busy === "save" ? "Saving…" : "Save & share"}
          </button>
        </div>
        <button
          type="button"
          onClick={props.onClear}
          className="w-full py-1 text-xs text-muted underline-offset-2 hover:text-terracotta hover:underline"
        >
          Clear trail
        </button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md text-[11px] text-muted transition hover:bg-paper-deep hover:text-ink disabled:opacity-25"
    >
      {children}
    </button>
  );
}
