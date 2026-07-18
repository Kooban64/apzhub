# APZMETRICS-005 — Performance Baseline

**Date:** 2026-07-18  
**Scope:** Qualitative review only — no benchmarking required

## Observations

| Area                       | Pattern                                                     |
| -------------------------- | ----------------------------------------------------------- |
| Metadata queries           | List/get via platform services + persistence                |
| Pagination / filter / sort | Supported on Workbench tables (metadata lists)              |
| Search                     | Client-side / list filters — no live analytics engine       |
| Lazy loading               | Section-routed Workbench views; React Query on demand       |
| Caching                    | TanStack Query + `metricsQueryKeys`; no polling / streaming |

Metadata-plane workloads are expected to remain modest relative to telemetry systems (which are out of scope).
