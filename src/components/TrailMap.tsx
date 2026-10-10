"use client";

import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { CATEGORY_META, OLD_DHAKA_CENTER, type Spot } from "@/data/spots";
import type { LatLng } from "@/lib/geo";
import SpotDetails from "./SpotDetails";

interface Props {
  spots: Spot[];
  tourIds: string[];
  selectedId: string | null;
  favourites: string[];
  userPos: LatLng | null;
  /** Start of the route line when the walk begins at the user's location. */
  origin: LatLng | null;
  /** Street-following route; straight lines between stops are drawn when null. */
  geometry: [number, number][] | null;
  distances: Map<string, number> | null;
  locating: boolean;
  onLocate: () => void;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onToggle: (id: string) => void;
  onFavourite: (id: string) => void;
}

function pinIcon(spot: Spot, stopNumber: number, selected: boolean, favourite: boolean) {
  const { color, emoji } = CATEGORY_META[spot.category];
  const isStop = stopNumber > 0;
  const classes = ["trail-pin", isStop && "is-stop", selected && "is-selected"].filter(Boolean).join(" ");
  const heart = favourite ? `<i class="trail-pin-fav">♥</i>` : "";
  return L.divIcon({
    className: "",
    html: `<div class="${classes}" style="background:${isStop ? "#2a1a12" : color}"><span>${isStop ? stopNumber : emoji}</span></div>${heart}`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

/** Re-frames the map whenever the tour's stops change. */
function FitTour({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length >= 2) map.fitBounds(points, { padding: [60, 60], maxZoom: 17 });
    else if (points.length === 1) map.flyTo(points[0], 17, { duration: 0.6 });
    // `key` captures the point list; `points` itself is a new array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

/** Flies to and opens the popup of the spot selected from the sidebar. */
function FocusSelected({ selectedId, markers }: { selectedId: string | null; markers: Map<string, L.Marker> }) {
  const map = useMap();
  useEffect(() => {
    const marker = selectedId ? markers.get(selectedId) : undefined;
    if (!marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 16), { duration: 0.5 });
    if (!marker.isPopupOpen()) marker.openPopup();
  }, [selectedId, markers, map]);
  return null;
}

/** Pans to the user whenever a fresh location fix arrives. */
function FlyToUser({ userPos }: { userPos: LatLng | null }) {
  const map = useMap();
  const key = userPos ? `${userPos.lat},${userPos.lng}` : "";
  useEffect(() => {
    if (userPos) map.flyTo([userPos.lat, userPos.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    // `key` captures the position; the object identity changes on every fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function TrailMap(props: Props) {
  const { spots, tourIds, selectedId, favourites, userPos, origin, geometry, distances } = props;
  // Stable mutable registry of Leaflet markers, filled by ref callbacks.
  const [markers] = useState(() => new Map<string, L.Marker>());
  const byId = useMemo(() => new Map(spots.map((s) => [s.id, s])), [spots]);

  const stopPoints = tourIds.flatMap((id) => {
    const s = byId.get(id);
    return s ? [[s.lat, s.lng] as [number, number]] : [];
  });
  const tourPoints: [number, number][] = origin ? [[origin.lat, origin.lng], ...stopPoints] : stopPoints;
  const routeLine = geometry ?? tourPoints;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={OLD_DHAKA_CENTER}
        zoom={15}
        minZoom={12}
        maxZoom={19}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · routes by <a href="https://routing.openstreetmap.de/">FOSSGIS OSRM</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="trail-tiles"
          maxZoom={19}
        />

        {routeLine.length >= 2 && (
          <>
            <Polyline positions={routeLine} pathOptions={{ color: "#fff", weight: 8, opacity: 0.85 }} />
            {/* Keyed so switching dashed ⇄ solid remounts: Leaflet's setStyle never clears a dashArray. */}
            <Polyline
              key={geometry ? "streets" : "straight"}
              positions={routeLine}
              pathOptions={
                geometry
                  ? { color: "#b4432b", weight: 4, opacity: 0.95, lineCap: "round", lineJoin: "round" }
                  : { color: "#b4432b", weight: 4, dashArray: "8 10", lineCap: "round" }
              }
            />
          </>
        )}

        {userPos && (
          <>
            <CircleMarker
              center={[userPos.lat, userPos.lng]}
              radius={16}
              pathOptions={{ stroke: false, fillColor: "#2b6cb0", fillOpacity: 0.18 }}
            />
            <CircleMarker
              center={[userPos.lat, userPos.lng]}
              radius={7}
              pathOptions={{ color: "#fff", weight: 3, fillColor: "#2b6cb0", fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                You are here
              </Tooltip>
            </CircleMarker>
          </>
        )}

        {spots.map((spot) => {
          const stopNumber = tourIds.indexOf(spot.id) + 1;
          const favourite = favourites.includes(spot.id);
          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={pinIcon(spot, stopNumber, spot.id === selectedId, favourite)}
              zIndexOffset={stopNumber > 0 ? 500 : 0}
              title={spot.name}
              alt={spot.name}
              ref={(m) => {
                if (m) markers.set(spot.id, m);
                else markers.delete(spot.id);
              }}
              eventHandlers={{
                click: () => props.onSelect(spot.id),
                popupclose: () => props.onDeselect(spot.id),
              }}
            >
              <Popup>
                <SpotDetails
                  spot={spot}
                  stopNumber={stopNumber}
                  favourite={favourite}
                  distanceFromUser={distances?.get(spot.id)}
                  onToggle={() => props.onToggle(spot.id)}
                  onFavourite={() => props.onFavourite(spot.id)}
                />
              </Popup>
            </Marker>
          );
        })}

        <FitTour points={routeLine} />
        <FocusSelected selectedId={selectedId} markers={markers} />
        <FlyToUser userPos={userPos} />
      </MapContainer>

      <button
        type="button"
        onClick={props.onLocate}
        aria-label="Show my location"
        title="Show my location"
        className="absolute bottom-6 right-3 z-[1000] grid size-10 place-items-center rounded-full border border-line bg-white text-lg shadow-md transition hover:bg-paper-deep"
      >
        {props.locating ? (
          <span className="size-4 animate-spin rounded-full border-2 border-[#2b6cb0] border-t-transparent" />
        ) : (
          "📍"
        )}
      </button>
    </div>
  );
}
