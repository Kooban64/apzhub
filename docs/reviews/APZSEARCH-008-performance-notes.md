# APZSEARCH-008 — Performance Notes

**Date:** 2026-07-14  
**Verdict:** **COLLECTED** (no optimisations)  
**Certification:** APZSEARCH-008

---

## Measurement method

Wall-clock Vitest focused on Search vertical certification harness + layered audits + OpenAPI validate. Host: Linux runner. No live Meilisearch latency measured.

## Suite timings (order of magnitude)

| Suite                                                                | Approx. wall clock                           |
| -------------------------------------------------------------------- | -------------------------------------------- |
| Vertical audit (`pnpm audit:search-vertical`, includes prior audits) | **~1–2 s** (PASS, 0 violations)              |
| Certification harness (9 tests)                                      | **~2.2 s** wall / **~1.1 s** test time       |
| OpenAPI validate platform                                            | **PASS** (valid)                             |
| Layered audits 001–007 (standalone)                                  | each **PASS**; total **~few seconds**        |
| APZSEARCH-007 scoped HTTP/client/Workbench Vitest                    | historically **29 PASS** (coverage baseline) |

## Surface sizes

| Surface            | Notes                                                 |
| ------------------ | ----------------------------------------------------- |
| HTTP handlers      | Thin gateway delegation; Zod validation               |
| Typed client       | JSON only; abortable fetch                            |
| Workbench          | React Query + client-side result presentation mapping |
| Execution provider | Mock Meilisearch `fetch` in unit tests                |

## Observations

- Query/management JSON dominates; no binary streaming on Search HTTP
- Provider timeouts/rate limits are exercised as error classifications in unit tests, not load tests
- No caching redesign, no CDN, no live query SLOs in this milestone

## Non-goals

No performance tuning · no indexing throughput · no OCR/AI latency · no Event Bus throughput.
