# Terminal Monitoring System — Control Room

A real-time vessel operations monitoring app designed for port control-room displays.

Built with **Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript**.

## Features

- **Auth** — username/password login, session cookie (signed, httpOnly, SameSite=Strict), logout.
- **Vessel Monitor** — vessel cards with 3D mouse-tilt, ship SVG with crane visualization, LOAD/DISCH/TOTAL progress, crane detail table.
- **Yard Monitor** — block grid grouped by block type, utilization gauge, violation/severity badges, priority alerts sidebar.
- **Equipment Monitor** — QC operation groups with assigned yard trucks (YTs), yard sections (RTG/RS/TL), TTT coloring, online/offline status.
- **YT Tracker** — GPS fleet view of yard trucks, per-truck speed/status, job type, assigned QC.
- **Terminal switch** (ACT / DCT) + per-terminal screen tabs.

## Screens

| Screen key               | Label                | Status         |
|--------------------------|----------------------|----------------|
| ACT/DCT_VSL_MONITOR      | Vessel Monitor       | Built          |
| ACT/DCT_EQU_MONITOR      | Equipment Monitor    | Built          |
| ACT/DCT_YARD_MONITOR     | Yard Monitor         | Built          |
| ACT/DCT_YT_TRACKER       | YT Tracker           | Built          |
| GATE_MONITOR             | Gate Monitor         | Not implemented |
| YARD_MONITOR             | Yard Monitor (overview) | Not implemented |
| BERTH_MONITOR            | Berth Monitor        | Not implemented |

## Configuration

Create `.env.local`:

```
BACKEND_URL=http://172.16.20.249:3000
AUTH_SECRET=your-secret
```

- `BACKEND_URL` — the backend server that the clone proxies data from.
- `AUTH_SECRET` — secret used to sign the local session cookie.

## Data Flow / API

The clone proxies to the backend. All browser requests hit the clone's
own `/api/*` routes, which forward to `BACKEND_URL`.

| Endpoint (clone)                  | Forwards to                    | Poll rate |
|-----------------------------------|--------------------------------|-----------|
| `GET /api/vessels?terminal={}`    | `<BACKEND>/api/vessels?...`     | 60s       |
| `GET /api/yard?terminal={}`       | `<BACKEND>/api/yard?...`        | 60s       |
| `GET /api/equipment?terminal={}`  | `<BACKEND>/api/equipment?...`   | 60s       |
| `GET /api/yt-tracking?terminal={}`| `<BACKEND>/api/yt-tracking?...` | 15s       |
| `POST /api/auth/login`            | `<BACKEND>/api/auth/login`      | on demand  |
| `GET /api/auth/session`           | local (signed cookie)           | on mount   |
| `POST /api/auth/logout`           | local                            | on demand  |

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
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```
