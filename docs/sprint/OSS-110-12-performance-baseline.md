# OSS-110-12 Performance Baseline

**Milestone:** OSS-110-12 — Support Vertical Slice Certification & Closeout  
**Date:** 2026-07-11  
**Environment:** Mocked Vitest (in-process, no live Zammad)  
**Note:** These timings reflect mock overhead only, **not production Zammad latency**.

---

## Methodology

Performance tests are in `testing/support-vertical/support-vertical-performance.baseline.test.ts`.

Each operation is measured with `performance.now()` in a mocked environment:
- Zammad adapter created with `createMockZammadFetch()` (in-memory mock)
- `InMemoryEntityMappingStore` (no PostgreSQL I/O)
- `createPlatformServicesWithZammad` wired through full stack
- HTTP handlers called directly (no network I/O)

The generous CI threshold is **5,000 ms** per operation — all mock operations complete far below this.

---

## HTTP-layer baselines (from CI run 2026-07-11)

| Operation | Label | Recorded ms |
|-----------|-------|------------|
| List support requests | `http.support.list` | 4.5 |
| Get support request | `http.support.get` | 4.8 |
| Create support request | `http.support.create` | 4.8 |
| Support search | `http.support.search` | 11.6 |
| Support analytics | `http.support.analytics` | 6.2 |
| Support history | `http.support.history` | 7.1 |
| List organizations | `http.support.organizations.list` | 3.0 |
| List groups | `http.support.groups.list` | 3.6 |
| List users | `http.support.users.list` | 3.9 |

**avg:** 5.5 ms | **min:** 3.0 ms | **max:** 11.6 ms (all mocked, no network I/O)

---

## Gateway-layer baselines (from CI run 2026-07-11)

| Operation | Label | Recorded ms |
|-----------|-------|------------|
| Gateway list requests | `gateway.support.listSupportRequests` | 1.4 |
| Gateway get request | `gateway.support.getSupportRequest` | 1.0 |
| Gateway create request | `gateway.support.createSupportRequest` | 0.8 |
| Gateway search | `gateway.supportSearch.search` | 15.3 |
| Gateway analytics | `gateway.supportAnalytics.getSupportIntelligence` | 4.0 |
| Gateway history | `gateway.supportHistory.getTimeline` | 1.9 |
| Adapter core list | `adapter.core.support.list` | 1.2 |
| Request pipeline | `requestPipeline.support.listSupportRequests` | 1.2 |

**avg:** 3.4 ms | **min:** 0.8 ms | **max:** 15.3 ms (all mocked, no network I/O)

---

## CI threshold

All operations: **< 5,000 ms** (generous mock threshold).

Actual output printed to CI logs as `SUPPORT_VERTICAL_HTTP_PERF_BASELINE` and `SUPPORT_VERTICAL_GATEWAY_PERF_BASELINE` JSON for capture.

---

## Production note

Production Zammad latency depends on:
- Network latency to self-hosted Zammad instance
- Zammad database query performance
- PostgreSQL mapping store read/write throughput
- Redis session cache hit rates

These baselines do not represent production targets. Production benchmarking requires a dedicated load-testing sprint.
