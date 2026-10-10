# Old Dhaka Food Trail

An interactive map of Puran Dhaka's famous food spots — Nanna Biryani, Haji Biryani, the
Lalbagh bakarkhani ovens, Beauty Lassi, Lalbagh Fort and more — where you build your own
walking food tour, optimise the route, and share it with a link.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, Leaflet + OpenStreetMap tiles and zod.
No API keys needed. The full product/engineering brief is in [`SYSTEM_PROMPT.md`](SYSTEM_PROMPT.md).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Features

- 15 curated spots in 6 categories, with search and category filters
- Map pins coloured by category; tour stops are numbered and joined by the walking route
- Tour panel: reorder, remove, per-leg walking distance/time, totals incl. eating time
- **Optimise route**: nearest-neighbour + 2-opt, first stop fixed
- **Save & share**: saves the tour and copies a `/?tour=<id>` link
- **Real walking routes** along Old Dhaka's lanes (FOSSGIS OSRM, foot profile), falling back to
  straight-line estimates if the routing service is down; **Walk it in Google Maps** for turn-by-turn
- **Ready-made trails**: Biryani Crawl, Mughal Heritage Walk, Riverside, Sweet Tooth, After-Dark Grill
  — one click to load (with Undo), then edit freely
- **Time & budget planner**: pick day + start time to see arrival/leave times, warnings when a spot is
  closed or closing, finish time, and estimated spend per person
- **My location + favourites**: 📍 locate, *Near me* sorts spots by walking distance, *Start the walk
  from my location* (within 8 km of Old Dhaka), ♥ favourites saved in the browser with their own filter
- Draft tour persists in `localStorage`; mobile layout with Explore / Trails / My trail tabs

## API

| Method | Path | Body / query |
| --- | --- | --- |
| GET | `/api/spots` | `?category=biryani&q=lassi` |
| GET | `/api/spots/:id` | — |
| POST | `/api/route-plan` | `{ "spotIds": [...], "optimize": true, "origin": { "lat", "lng" } \| null }` |
| GET | `/api/trails` | — curated trails with estimated totals |
| POST | `/api/tours` | `{ "name": "...", "spotIds": [...] }` |
| GET | `/api/tours/:id` | — |

Distances come from real street routing when available (`plan.source: "streets"`, plus `geometry`);
otherwise straight line × 1.35 (`"estimate"`). Walking speed 4 km/h. Set `OSRM_FOOT_URL` to use your
own OSRM server instead of the public FOSSGIS one.

## Notes

- Coordinates are **approximate** (lane-level); hours and prices are indicative.
- Saved tours are stored in `data/tours.json` (git-ignored). That works locally and on a
  normal Node server, but not on serverless hosts like Vercel (read-only, ephemeral
  filesystem) — swap `src/lib/tourStore.ts` for a database (e.g. Supabase) before deploying there.
