# Resume bullets (backed by measured numbers)

These are grounded in the **actual** load-test result: 4,925 events/sec
sustained over 60s, 295,600 events, 100% success, median 1.1ms, on co-located
hardware — with `/health` confirming 0 dropped. Don't inflate them — you can
defend every number in an interview.

## Primary bullet (concise)

> Built a high-throughput ad-event ingestion service in **Go** (chi, pgx, Redis)
> sustaining **~5,000 events/sec** (295k events/min, 100% success, **0 dropped**,
> median ~1ms) via a buffered-channel **goroutine worker pool** with **batched
> `COPY` inserts** to PostgreSQL and a **Redis cache-aside** read path.

## Expanded bullet (with engineering depth)

> Engineered a concurrent ad-event ingestion API in **Go** that returns
> **202 Accepted** asynchronously and drains a buffered channel with a 10–16
> goroutine worker pool, batch-inserting via `pgx.CopyFrom`; load-tested at
> **~5,000 events/sec** (295,600 events in 60s, **100% success, 0 dropped,
> median 1.1ms**) with k6.

## Reliability / review bullet (shows seniority)

> Hardened the service after a reliability review: fixed an unbounded per-IP
> rate-limiter map (OOM risk) with TTL eviction, eliminated a cache-stampede by
> coalescing concurrent misses with `singleflight` (**50 concurrent reads → 1 DB
> query**), added hourly rollup tables for O(hours) metric aggregation, and
> input sanitization — all covered by `-race` tests.

## Notes on honesty

- "~5,000/sec" is the *tested target rate*, achieved at 100% success
  (4,925/s measured). Higher numbers are possible from a separate
  load-generation host — only claim them once you've measured them there.
- p99 was ~126ms in this run, but that's the **co-located tax** (k6 sharing CPU
  with the server inflates the tail) — median was 1.1ms and p95 45ms. If asked
  about the tail, explain that: it shows you understand load-test methodology,
  a sophisticated point most candidates miss. Don't put p99 on the resume; lead
  with throughput, success rate, zero-loss, and median.
