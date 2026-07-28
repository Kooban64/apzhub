# Performance Results — Platform-1.4-OR-001

> **Date:** 2026-07-23 · **Measured values only** · No optimisation performed

## Live PostgreSQL probe (`apzhub-postgres`)

Throwaway table `or001_validation_probe` (dropped after run).

| Metric                                                    | Measured value                 | Notes                                |
| --------------------------------------------------------- | ------------------------------ | ------------------------------------ |
| Claim batch 1000 rows (`FOR UPDATE SKIP LOCKED` + UPDATE) | **20.862 ms** (`psql \timing`) | 5000-row table                       |
| Implied claim throughput                                  | **≈ 47,900 rows/s**            | 1000 / 0.020862 s (SQL pattern only) |
| Insert 5000 probe rows                                    | **35.190 ms**                  | Setup only                           |
| Concurrent dual-worker claim (50+50)                      | Completed without ID collision | Latency not separately timed         |

## In-memory claim engine (Vitest)

| Metric                                         | Measured value                                                  |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `claim-lease-engine.test.ts` (8 tests)         | **15 ms** test body; wall **≈ 4.74 s** including Vitest startup |
| Affected durable notification suite (76 tests) | **≈ 5.9–7.4 s** wall (prior OR-001 run)                         |

## Not measured (blocked or out of scope)

| Metric                                                       | Reason                                                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Dispatch throughput (product durable worker)                 | Product tables absent (OR-DEF-001); would require flag ON + live schema |
| Retry latency (product)                                      | OR-DEF-001                                                              |
| Lease renew latency (product API)                            | OR-DEF-001                                                              |
| Worker startup / shutdown (process wall clock in production) | Not instrumented in this host run; unit coverage only                   |
| Queue depth / processing rate (production)                   | No durable queue populated on live DB                                   |

## Honesty

Figures above are **probe/SQL and unit-suite timings**, not production SLO certification.
