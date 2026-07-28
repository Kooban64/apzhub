# Performance Review — Platform 1.2.0

> **Programme:** APZHUB-OPS-001  
> **Status:** **PARTIAL** (thin quantitative baseline)

## Verified

| Item                   | Evidence                                    | Finding                                                           |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| Performance management | `PERFORMANCE-MANAGEMENT.md`                 | Qualitative loop / anti-patterns                                  |
| Capacity               | `CAPACITY-PLANNING.md` · host coexistence   | Disk 80%/90% thresholds; shared-host controls                     |
| Caching                | Redis in stack; platform cache policy       | Present; SoR constraints documented                               |
| Startup / memory / CPU | No certified prod SLO pack in ops           | **Gap** — no filed p95/latency/capacity certification for cutover |
| DB performance         | Migrations + health checks                  | Operational, not load-certified                                   |
| Response times         | Playwright Soft perf residual (flaky class) | Not a prod capacity baseline                                      |

## Before production

- Agree interactive latency expectations for Tier A journeys.
- Smoke critical paths under coexistence load after deploy.

## After production

- Formal performance baseline programme (Owner-authorised).
- Outbox/DLQ growth watches.
