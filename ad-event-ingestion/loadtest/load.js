// k6 throughput test for POST /events.
//
// IMPORTANT: this measures ingestion throughput, so the server's per-IP rate
// limiter must NOT be the bottleneck. k6 runs from a single IP, so raise the
// server limit for the test, e.g.:
//
//   RATE_RPS=100000 RATE_BURST=200000 docker compose up -d --build
//
// Then run:
//   k6 run loadtest/load.js
//   k6 run -e TARGET_RPS=5000 -e DURATION=60s loadtest/load.js
//
// If you see lots of 429s, the rate limiter is throttling you (working as
// intended) — bump RATE_RPS/RATE_BURST as above.

import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
// Default to a modest rate that a single laptop running k6 + the stack can
// actually sustain. Raise it (and ideally run k6 from a separate host) once the
// baseline is clean: -e TARGET_RPS=5000
const TARGET_RPS = parseInt(__ENV.TARGET_RPS || '1000', 10);
const DURATION = __ENV.DURATION || '30s';
// p99 latency threshold (ms). Lenient default for a single co-located laptop;
// tighten it when running k6 from a separate host, e.g. -e P99_MS=50
const P99_MS = parseInt(__ENV.P99_MS || '150', 10);

const accepted = new Counter('events_accepted');
const throttled = new Rate('events_throttled_429');

export const options = {
  scenarios: {
    ingest: {
      executor: 'constant-arrival-rate',
      rate: TARGET_RPS,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 100,
      maxVUs: 800,
    },
  },
  thresholds: {
    // p99 target, configurable via P99_MS. Default 150ms is realistic on a
    // single laptop sharing CPU with Postgres/Redis at high RPS; pass
    // -e P99_MS=50 when running k6 from a separate host.
    http_req_duration: [`p(99)<${P99_MS}`],
    'events_throttled_429': ['rate<0.01'],   // <1% throttled (raise RATE_RPS if not)
  },
};

const TYPES = ['click', 'impression', 'conversion'];
const CAMPAIGNS = ['camp_1', 'camp_2', 'camp_3', 'camp_4', 'camp_5'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
  const payload = JSON.stringify({
    type: pick(TYPES),
    campaign_id: pick(CAMPAIGNS),
    user_id: `u_${Math.floor(Math.random() * 100000)}`,
    timestamp: new Date().toISOString(),
  });

  const res = http.post(`${BASE}/events`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'status is 202': (r) => r.status === 202 });
  throttled.add(res.status === 429);
  if (res.status === 202) accepted.add(1);
}
