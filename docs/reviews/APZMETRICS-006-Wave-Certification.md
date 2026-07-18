# APZMETRICS-006 — Platform Metrics Wave Certification

**Date:** 2026-07-18  
**Programme status:** **closed/frozen**  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** (retained)

## Summary

| Area                                    | Result                                                          |
| --------------------------------------- | --------------------------------------------------------------- |
| Architecture compliance                 | PASS — frozen path retained                                     |
| Vertical certification (APZMETRICS-005) | PASS — `certify:metrics-vertical`                               |
| Wave closeout audit                     | PASS — `audit:metrics-wave`                                     |
| OpenAPI validation                      | PASS — **1.9.0** Platform Metrics Administration                |
| Authorization validation                | PASS — `PLATFORM_METRICS_PERMISSIONS` / `metricsPlatformOps`    |
| Documentation completeness              | PASS — freeze notice, reference standard, ops, future, evidence |
| Operational readiness                   | PASS — guide published                                          |

## Architecture under certification

```text
Metrics Administration Workbench
→ Metrics Typed Client
→ HTTP API
→ PlatformServiceGateway.metrics.*
→ RequestPipeline
→ Production Authorization
→ Platform Metrics Services
→ Metrics Core
→ Metrics Persistence
→ PostgreSQL
```

## Quality evidence

See [Quality Evidence](./APZMETRICS-006-Quality-Evidence.md) and APZMETRICS-005 evidence pack.

## Next (not authorised)

**APZSEARCH-016 — Product Indexing Orchestration Framework** — do not implement. (APZSEARCH-001 already complete.)
