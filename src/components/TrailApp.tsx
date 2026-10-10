"use client";

import { useEffect, useMemo, useState } from "react";
import { OLD_DHAKA_CENTER, SPOTS, SPOT_BY_ID, type Category } from "@/data/spots";
import type { CuratedTrail } from "@/data/trails";
import { formatMeters } from "@/lib/format";
import { haversineMeters, walkingMeters, type LatLng } from "@/lib/geo";
import { googleMapsDirections } from "@/lib/links";
import type { TourPlan } from "@/lib/planner";
import { budget, buildSchedule, toMinutes } from "@/lib/schedule";
import { MAX_ORIGIN_METERS, MAX_STOPS } from "@/lib/validation";
import SpotList from "./SpotList";
import TourPanel from "./TourPanel";
import TrailMap from "./TrailMap";
import TrailsList from "./TrailsList";

export type SpotFilter = Category | "all" | "favourites";

const DRAFT_KEY = "old-dhaka-food-trail:draft";
const FAV_KEY = "old-dhaka-food-trail:favourites";
const DEFAULT_NAME = "My Old Dhaka food walk";
const CENTER: LatLng = { lat: OLD_DHAKA_CENTER[0], lng: OLD_DHAKA_CENTER[1] };

interface Draft {
  tourIds: string[];
  tourName: string;
  startTime: string;
}

const validIds = (ids: unknown): string[] =>
  Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && SPOT_BY_ID.has(id)) : [];

function nextFullHour(): string {
  return `${String((new Date().getHours() + 1) % 24).padStart(2, "0")}:00`;
}

function loadDraft(): Draft {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (raw) {
      return {
        tourIds: validIds(raw.tourIds).slice(0, MAX_STOPS),
        tourName: typeof raw.tourName === "string" && raw.tourName.trim() ? raw.tourName : DEFAULT_NAME,
        startTime: typeof raw.startTime === "string" && /^\d\d:\d\d$/.test(raw.startTime) ? raw.startTime : nextFullHour(),
      };
    }
  } catch {
    // Corrupt draft — start fresh.
  }
  return { tourIds: [], tourName: DEFAULT_NAME, startTime: nextFullHour() };
}

function loadFavourites(): string[] {
  try {
    return validIds(JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

const originKey = (o: LatLng | null) => (o ? `${o.lat.toFixed(5)},${o.lng.toFixed(5)}` : "");

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data as T;
}

interface Notice {
  text: string;
  /** Trail to restore if the user hits Undo. */
  undo?: { tourIds: string[]; tourName: string };
}

export default function TrailApp() {
  const [draft] = useState(loadDraft);
  const [tourIds, setTourIds] = useState<string[]>(draft.tourIds);
  const [tourName, setTourName] = useState(draft.tourName);
  const [startTime, setStartTime] = useState(draft.startTime);
  const [startDay, setStartDay] = useState(() => new Date().getDay());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SpotFilter>("all");
  const [query, setQuery] = useState("");
  const [planState, setPlanState] = useState<{ key: string; plan: TourPlan } | null>(null);
  const [busy, setBusy] = useState<"optimize" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"spots" | "trails">("spots");
  const [mobileTab, setMobileTab] = useState<"explore" | "trails" | "tour">("explore");
  const [favourites, setFavourites] = useState<string[]>(loadFavourites);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [startFromMe, setStartFromMe] = useState(false);

  // Open a shared tour from /?tour=<id>.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("tour");
    if (!id) return;
    fetch(`/api/tours/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load that tour");
        setTourIds(data.tour.spotIds);
        setTourName(data.tour.name);
        setMobileTab("tour");
        setNotice({ text: `Loaded shared trail “${data.tour.name}”` });
      })
      .catch((err: Error) => setNotice({ text: `${err.message} — showing your own draft instead.` }));
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ tourIds, tourName, startTime } satisfies Draft));
  }, [tourIds, tourName, startTime]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favourites));
  }, [favourites]);

  // ---- location ----
  const userDistanceFromOldDhaka = userPos ? haversineMeters(userPos, CENTER) : null;
  const originBlocker = !userPos
    ? "Tap 📍 on the map to share your location first."
    : userDistanceFromOldDhaka! > MAX_ORIGIN_METERS
      ? `You're ${formatMeters(userDistanceFromOldDhaka!)} from Old Dhaka — too far to walk from.`
      : null;
  const origin = startFromMe && !originBlocker ? userPos : null;

  const distances = useMemo(
    () => (userPos ? new Map(SPOTS.map((s) => [s.id, walkingMeters(userPos, s)])) : null),
    [userPos],
  );

  function locate() {
    if (!("geolocation" in navigator)) {
      setNotice({ text: "Your browser can't share its location." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLocating(false);
        setNearMe(false);
        setNotice({
          text:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied — allow it in your browser to use Near me."
              : "Couldn't get your location. Try again outdoors or with Wi-Fi on.",
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  function toggleNearMe() {
    if (nearMe) return setNearMe(false);
    setNearMe(true);
    if (!userPos) locate();
  }

  // ---- plan ----
  const tourKey = tourIds.join(",");
  const planKey = `${tourKey}|${originKey(origin)}`;

  // Recompute legs/totals on the server whenever the stops or the starting point change.
  useEffect(() => {
    const [ids, o] = planKey.split("|");
    if (!ids) return;
    const [lat, lng] = o ? o.split(",").map(Number) : [];
    const ctrl = new AbortController();
    postJson<{ plan: TourPlan }>(
      "/api/route-plan",
      { spotIds: ids.split(","), origin: o ? { lat, lng } : null },
      ctrl.signal,
    )
      .then(({ plan }) => setPlanState({ key: planKey, plan }))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => ctrl.abort();
  }, [planKey]);

  // A plan is only shown while it still matches the current stops and start.
  const plan = planState?.key === planKey ? planState.plan : null;

  const tourSpots = useMemo(() => tourIds.flatMap((id) => SPOT_BY_ID.get(id) ?? []), [tourIds]);
  const schedule = useMemo(
    () => (plan ? buildSchedule(tourSpots, plan.legs, startDay, toMinutes(startTime)) : null),
    [plan, tourSpots, startDay, startTime],
  );
  const tourBudget = useMemo(() => budget(tourSpots), [tourSpots]);
  const mapsLink = googleMapsDirections(origin ? [origin, ...tourSpots] : tourSpots);

  // ---- spot list ----
  const visibleSpots = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = SPOTS.filter(
      (s) =>
        (filter === "all" || (filter === "favourites" ? favourites.includes(s.id) : s.category === filter)) &&
        (!q || [s.name, s.nameBn, s.area, s.famousFor, ...s.mustTry].some((f) => f.toLowerCase().includes(q))),
    );
    return nearMe && distances ? list.sort((a, b) => distances.get(a.id)! - distances.get(b.id)!) : list;
  }, [filter, query, favourites, nearMe, distances]);

  // The map keeps tour stops visible even when filters hide them from the list.
  const mapSpots = useMemo(
    () => SPOTS.filter((s) => visibleSpots.includes(s) || tourIds.includes(s.id)),
    [visibleSpots, tourIds],
  );

  // ---- tour edits ----
  function changeTour(next: string[]) {
    setTourIds(next);
    setShareUrl(null);
    setError(null);
  }

  function toggle(id: string) {
    if (tourIds.includes(id)) return changeTour(tourIds.filter((t) => t !== id));
    if (tourIds.length >= MAX_STOPS) return setError(`A trail can have at most ${MAX_STOPS} stops.`);
    changeTour([...tourIds, id]);
  }

  function toggleFavourite(id: string) {
    setFavourites((favs) => (favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]));
  }

  function move(index: number, delta: -1 | 1) {
    const next = [...tourIds];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    changeTour(next);
  }

  function loadTrail(trail: CuratedTrail) {
    const previous = { tourIds, tourName };
    changeTour(trail.spotIds);
    setTourName(trail.name);
    setStartTime(trail.bestStart);
    setMobileTab("tour");
    setNotice({
      text: `Loaded “${trail.name}” — starts ${trail.bestStart}`,
      undo: previous.tourIds.length ? previous : undefined,
    });
    window.history.replaceState(null, "", "/");
  }

  function undoLoad(previous: NonNullable<Notice["undo"]>) {
    changeTour(previous.tourIds);
    setTourName(previous.tourName);
    setNotice(null);
  }

  async function optimize() {
    setBusy("optimize");
    try {
      const { plan } = await postJson<{ plan: TourPlan }>("/api/route-plan", {
        spotIds: tourIds,
        optimize: true,
        origin,
      });
      changeTour(plan.spotIds);
      setPlanState({ key: `${plan.spotIds.join(",")}|${originKey(origin)}`, plan });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    setError(null);
    try {
      const { tour } = await postJson<{ tour: { id: string } }>("/api/tours", { name: tourName, spotIds: tourIds });
      const url = `${window.location.origin}/?tour=${tour.id}`;
      window.history.replaceState(null, "", `/?tour=${tour.id}`);
      await navigator.clipboard?.writeText(url).catch(() => undefined);
      setShareUrl(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function clear() {
    changeTour([]);
    setPlanState(null);
    setTourName(DEFAULT_NAME);
    window.history.replaceState(null, "", "/");
  }

  // ---- views ----
  const tourPanel = (
    <TourPanel
      tourIds={tourIds}
      tourName={tourName}
      plan={plan}
      schedule={schedule}
      budget={tourBudget}
      startDay={startDay}
      startTime={startTime}
      startFromMe={startFromMe}
      originBlocker={originBlocker}
      mapsLink={mapsLink}
      busy={busy}
      shareUrl={shareUrl}
      error={error}
      onName={(name) => {
        setTourName(name);
        setShareUrl(null);
      }}
      onStartDay={setStartDay}
      onStartTime={setStartTime}
      onStartFromMe={setStartFromMe}
      onMove={move}
      onRemove={toggle}
      onSelect={setSelectedId}
      onOptimize={optimize}
      onSave={save}
      onClear={clear}
    />
  );

  const spotList = (
    <SpotList
      spots={visibleSpots}
      tourIds={tourIds}
      selectedId={selectedId}
      filter={filter}
      query={query}
      favourites={favourites}
      distances={distances}
      nearMe={nearMe}
      locating={locating}
      onFilter={setFilter}
      onQuery={setQuery}
      onNearMe={toggleNearMe}
      onSelect={setSelectedId}
      onToggle={toggle}
      onFavourite={toggleFavourite}
    />
  );

  const trailsList = <TrailsList onLoad={loadTrail} />;

  return (
    <main className="relative flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[340px_1fr_360px] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
      <aside className="hidden min-h-0 flex-col border-r border-line bg-paper lg:flex">
        <Tabs
          value={sidebarTab}
          onChange={setSidebarTab}
          tabs={[
            ["spots", "Explore spots"],
            ["trails", "Ready-made trails"],
          ]}
        />
        <div className="min-h-0 flex-1">{sidebarTab === "spots" ? spotList : trailsList}</div>
      </aside>

      <section className="relative h-[45dvh] shrink-0 lg:h-auto" aria-label="Map of Old Dhaka food spots">
        <TrailMap
          spots={mapSpots}
          tourIds={tourIds}
          selectedId={selectedId}
          favourites={favourites}
          userPos={userPos}
          origin={origin}
          geometry={plan?.geometry ?? null}
          distances={distances}
          locating={locating}
          onLocate={locate}
          onSelect={setSelectedId}
          onDeselect={(id) => setSelectedId((cur) => (cur === id ? null : cur))}
          onToggle={toggle}
          onFavourite={toggleFavourite}
        />
        {notice && (
          <div className="absolute left-1/2 top-3 z-[1000] flex max-w-[92%] -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-xs text-paper shadow-lg">
            <span>{notice.text}</span>
            {notice.undo && (
              <button
                type="button"
                onClick={() => undoLoad(notice.undo!)}
                className="font-semibold text-saffron hover:underline"
              >
                Undo
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setNotice(null)}
              className="opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      <aside className="hidden min-h-0 border-l border-line bg-paper lg:block">{tourPanel}</aside>

      {/* Mobile bottom sheet */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-line bg-paper lg:hidden">
        <Tabs
          value={mobileTab}
          onChange={setMobileTab}
          tabs={[
            ["explore", "Explore"],
            ["trails", "Trails"],
            ["tour", `My trail (${tourIds.length})`],
          ]}
        />
        <div className="min-h-0 flex-1">
          {mobileTab === "explore" ? spotList : mobileTab === "trails" ? trailsList : tourPanel}
        </div>
      </div>
    </main>
  );
}

function Tabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: [T, string][];
}) {
  return (
    <div className="flex border-b border-line" role="tablist">
      {tabs.map(([tab, label]) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
          className={`flex-1 py-2.5 text-sm font-semibold transition ${
            value === tab ? "border-b-2 border-terracotta text-terracotta" : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
