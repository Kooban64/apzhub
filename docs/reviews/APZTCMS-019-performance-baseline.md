# APZTCMS-019 — Performance Baseline

**Date:** 2026-07-12  
**Mode:** Measure only — **no optimisations**

---

## Suite timings (this session)

| Suite | Approx duration |
| ----- | --------------- |
| Focused vertical Vitest (adapter + providers + client + view) | **~6.5 s** wall (`elapsed_sec=6.49`) |
| Broader vertical regression (**103** tests / 17 files) | **~10.8 s** |
| Adapter package coverage run | included in session coverage batch |

## Size baseline (LOC, approximate)

| Area | LOC (wc) |
| ---- | -------- |
| Presentation pipeline modules (client + view + errors + types) | ~1.5k+ of measured set |
| Combined measured pipeline UX + related | **5746** lines across sampled paths |
| HTTP routes | **18** route files |

## Notes

- No production load testing performed.
- No caching / query optimisation changes.
- Live GitHub API latency not measured (mocked only).

Re-measure under load before capacity planning.
