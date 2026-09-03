# Terminal Monitoring System — Control Room (Clone)

A full re-implementation of the **Terminal Monitoring System — Control Room** — a
real-time vessel operations monitoring app designed for port control-room
displays (Smart TVs).

Built with **Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript**.

---

## Features

- **Auth** — username/password login, session cookie (signed, httpOnly), logout.
- **Vessel Monitor** — vessel cards, animated water waves, crane visualization,
  LOAD/DISCH/TOTAL progress, crane detail table, duplicate-QC conflict detection.
- **Yard Monitor** — block grid grouped by block type, fill-ratio rings,
  violation/severity badges, violations feed + summary panel.
- **Equipment Monitor** — QC operation groups with assigned yard trucks (YTs),
  yard sections (RTG/YT/TL/...), TTT coloring, online/offline status, status panel.
- **YT Tracker** — live fleet map of yard trucks grouped by their yard position,
  per-truck online/offline, driver, job type, TTT, assigned QC, and fleet/summary
  stats with online/offline/all filters.
- **Dark mode** toggle (persisted to `localStorage`).
- **Terminal switch** (ACT / DCT) + per-terminal screen tabs.
- **Screen router** with placeholder pages for not-yet-built modules.

## Screens

| Screen key               | Label                | Status         |
|--------------------------|----------------------|----------------|
| ACT/DCT_VSL_MONITOR      | Vessel Monitor       | Built          |
| ACT/DCT_EQU_MONITOR      | Equipment Monitor    | Built          |
| ACT/DCT_YARD_MONITOR     | Yard Monitor         | Built          |
| ACT/DCT_YT_TRACKER       | YT Tracker           | Built          |
| GATE_MONITOR             | Gate Monitor (overview) | Built          |
| YARD_MONITOR             | Yard Monitor (overview) | Built          |
| BERTH_MONITOR            | Berth Monitor        | Built          |

> Smart TV compatibility notes: the app relies on CSS custom properties and is
> styled with Tailwind CSS v4, whose utilities ship inside `@layer` blocks. Many
> older smart-TV webviews (legacy Tizen/webOS/Chromium) ignore `@layer`, which
> would drop every utility class and break the layout. To fix this, `npm run
> build` auto-generates `public/tv-compat.css` (via `scripts/gen-tv-compat.js`)
> containing the same rules re-emitted as unlayered plain CSS, and the root
> `layout.tsx` links it. Critical Tailwind theme tokens are also mirrored in
> `src/app/globals.css` outside any layer so spacing/colors/fonts resolve on all
> browsers. Re-run `npm run build` (or manually `node scripts/gen-tv-compat.js`)
> whenever CSS classes change so the compatible file stays in sync.

## Configuration

Create `.env.local` from `.env.local.example`:

```
BACKEND_URL=http://172.16.20.249:3000
AUTH_SECRET=your-secret
```

- `BACKEND_URL` — the original server that the clone proxies data from.
- `AUTH_SECRET` — secret used to sign the local session cookie.

## Data Flow / API

The clone proxies to the original backend. All browser requests hit the clone's
own `/api/*` routes, which forward to `BACKEND_URL`.

| Endpoint (clone)                  | Forwards to                    | Poll rate |
|-----------------------------------|--------------------------------|-----------|
| `GET /api/vessels?terminal={}`    | `<BACKEND>/api/vessels?...`     | 60s       |
| `GET /api/yard?terminal={}`       | `<BACKEND>/api/yard?...`        | 60s       |
| `GET /api/equipment?terminal={}`  | `<BACKEND>/api/equipment?...`   | 30s       |
| `GET /api/gate?terminal={}`       | `<BACKEND>/api/gate?...`        | 30s       |
| `GET /api/berth?terminal={}`      | `<BACKEND>/api/berth?...`       | 60s       |
| `GET /api/yt-tracking?terminal={}`| `<BACKEND>/api/yt-tracking?...` | 5s        |
| `GET /api/terminal-layout?terminal={}` | `<BACKEND>/TerminalLayout_{}.svg` | on mount |
| `POST /api/auth/login`            | `<BACKEND>/api/auth/login`      | on demand  |
| `GET /api/auth/session`           | local (signed cookie)           | on mount   |
| `POST /api/auth/logout`           | local                            | on demand  |

> Data is fetched via **HTTP polling** (not WebSocket). Each monitor aligns to
> the interval in the table above.

> `/api/gate` and `/api/berth` proxy to the original backend the same way the
> other routes do. If `BACKEND_URL` doesn't yet implement those two endpoints,
> the Gate Monitor and Berth Monitor screens fall back to sample data so the
> UI stays usable — swap in real data by implementing the two routes on the
> backend.

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # edit BACKEND_URL / AUTH_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build (also regenerates public/tv-compat.css)
npm run start    # serve production build
npm run lint     # eslint
node scripts/gen-tv-compat.js   # regenerate Smart TV CSS fallback only
```
