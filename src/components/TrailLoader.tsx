"use client";

import dynamic from "next/dynamic";

// The whole planner reads localStorage/window and Leaflet touches `window` on import,
// so it only ever renders in the browser.
const TrailApp = dynamic(() => import("./TrailApp"), {
  ssr: false,
  loading: () => (
    <div className="grid flex-1 place-items-center bg-paper-deep text-sm text-muted">
      Unrolling the map of Puran Dhaka…
    </div>
  ),
});

export default function TrailLoader() {
  return <TrailApp />;
}
