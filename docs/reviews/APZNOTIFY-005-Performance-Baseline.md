# APZNOTIFY-005 — Performance Baseline

**Mode:** Measure only — no optimisation in this milestone.

## Method

Vitest wall-clock observations from consolidated Notification suites (2026-07-16). Figures are indicative CI-local baselines, not SLOs.

| Surface                                     | Observation                                           |
| ------------------------------------------- | ----------------------------------------------------- |
| Notification packages + services Vitest     | Individual suites typically &lt; 100 ms               |
| Typed client unit suite                     | ~40 ms                                                |
| Workbench view suite (28 cases)             | ~3.7 s total (jsdom + React Query)                    |
| Overview render (first paint path in tests) | Sub-second within view suite                          |
| HTTP handlers                               | Exercised via gateway/service unit path; no load test |

## Notes

- No polling / realtime caches in Workbench
- No delivery fan-out cost (providers unavailable)
- Live HTTP latency against production Postgres not measured in this certification session

Re-measure under load only if a future delivery or scale milestone requires it.
