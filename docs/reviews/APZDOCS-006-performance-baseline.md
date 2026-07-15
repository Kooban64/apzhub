# APZDOCS-006 — Performance Baseline

**Date:** 2026-07-13  
**Verdict:** **COLLECTED** (no optimisations)  
**Certification:** APZDOCS-006

---

## Measurement method

Wall-clock Vitest focused on Document Platform packages + HTTP handlers + typed client + Workbench + foundation harnesses. Host: CI/dev Linux runner.

## Suite timings

| Suite | Approx. wall clock |
| ----- | ------------------ |
| Document vertical Vitest (88 tests, 22 files) | **~11.2 s** |
| Architecture audit (`apzdocs-006`) | **&lt;1 s** |
| OpenAPI validate platform | **~4 s** |

## Surface sizes (order of magnitude)

| Surface | Notes |
| ------- | ----- |
| HTTP handlers | Thin gateway delegation |
| Typed client | Metadata JSON only |
| Workbench | React Query + client-side filter/sort/paginate |
| Storage metadata | Descriptor lookups (no binary streaming) |

## Observations

- Metadata list/get dominate Workbench query load
- Version lookup and diagnostics are lightweight JSON
- No live S3/Postgres latency measured in this baseline (unit/stub only)

## Non-goals

No caching redesign · no query optimisation · no CDN · no binary throughput benchmarks.
