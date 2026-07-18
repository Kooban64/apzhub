# APZMETRICS-005 — Vertical Certification

**Date:** 2026-07-18  
**Scope:** Platform Metrics System of Record (metadata governance plane)  
**Classification:** See [Production Readiness](./APZMETRICS-005-Production-Readiness.md)

## Certified path

```text
Metrics Administration Workbench
→ createHttpMetricsClient() / metrics-api
→ /api/v1/metrics/*
→ PlatformServiceGateway.metrics.*
→ RequestPipeline
→ Production Authorization
→ Platform Metrics Services
→ Metrics Core
→ Metrics Persistence
→ PostgreSQL
```

## Gates

| Gate                                   | Result                                      |
| -------------------------------------- | ------------------------------------------- |
| `pnpm audit:metrics-foundation`        | PASS                                        |
| `pnpm audit:metrics-platform-services` | PASS                                        |
| `pnpm audit:metrics-http-client`       | PASS                                        |
| `pnpm audit:metrics-workbench`         | PASS                                        |
| `pnpm audit:metrics-vertical`          | PASS                                        |
| `pnpm certify:metrics-vertical`        | PASS (composes audits + harness + coverage) |
| `pnpm openapi:validate:platform`       | PASS (1.9.0)                                |
| Vitest `testing/metrics-vertical`      | PASS (10 journeys)                          |
| Playwright live webServer              | LIMITED (Testing slug conflict — external)  |

## Intentional non-defects

No metric calculation, formula/KPI/aggregation/threshold execution, analytics, reporting, dashboards, Prometheus/Grafana/OTel, collection/ingest, Event Bus, or AI.

## Next (not authorised)

**APZMETRICS-006 — Metrics Wave Certification & Architecture Freeze** — do not implement.
