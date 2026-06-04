# Ad Event Ingestion — Dashboard

A modern React dashboard for the [Ad Event Ingestion Engine](https://github.com/Sayan-Ghosh-5/ad-ingestion-event)
Go backend. Two views:

- **Advertiser Analytics** — live campaign KPIs (impressions, clicks,
  conversions, CTR) + a Recharts bar chart, polling `GET /campaigns/{id}/metrics`
  every 3s, with a **Clear Cache** action that hits `POST /campaigns/{id}/invalidate`.
- **System Monitor** — backend health (`GET /health`) polled every 1s, plus a
  **Load Generator** that POSTs batches of randomized events so you can watch the
  `queue_depth` spike and drain in real time.

## Stack

React (Vite) · Tailwind CSS · TanStack Query · Recharts · Lucide · Axios

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

The backend is expected at `http://localhost:8080`. Override with an env var:

```bash
VITE_API_BASE_URL=http://192.168.1.10:8080 npm run dev
```

### CORS

The dashboard calls the Go API from the browser, so the backend must send CORS
headers (e.g. `Access-Control-Allow-Origin`). If you can't enable CORS on the
backend, use the Vite dev proxy instead — uncomment the `proxy` block in
`vite.config.js` and set `API_BASE_URL` to `''` (same origin).

## Build

```bash
npm run build        # outputs to dist/
npm run preview
```

## Project structure

```
src/
  api/client.js          Axios instance + endpoint wrappers
  components/            Card, StatCard, StatusBadge, Toast
  views/
    AdvertiserAnalytics.jsx   View 1 (business)
    SystemMonitor.jsx         View 2 (engineering)
  lib/utils.js           formatting + event generation helpers
  App.jsx                layout + sidebar navigation
  main.jsx               React Query provider + toast provider
```
