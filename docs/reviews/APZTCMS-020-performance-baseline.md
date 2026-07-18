# APZTCMS-020 — Performance Baseline

**Date:** 2026-07-12  
**Mode:** Measure only — **no optimisations**

---

## Suite timings

| Measurement                                       | Value            |
| ------------------------------------------------- | ---------------- |
| Vertical regression Vitest (17 files / 103 tests) | **~9.74 s** wall |
| APZTCMS-019 comparable run                        | ~10.8 s          |

## Coverage collection batch

Included adapter, providers, domain pipelines, and presentation module coverage runs in the same session (see Quality Report).

## Notes

- No live GitHub API latency sampled.
- No rendering FPS / browser profiling.
- Official baseline for future CI/CD adapters: meet or beat these quality bars without claiming this wall-clock as an SLA.
