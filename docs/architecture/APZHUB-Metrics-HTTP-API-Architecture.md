# APZHUB Metrics HTTP API Architecture

**Milestone:** APZMETRICS-003  
**Status:** Active  
**Scope:** Metadata governance HTTP transport only

---

## Architecture

```text
Future Metrics Workbench
  ↓
Metrics Typed Client (apps/web/lib/metrics)
  ↓
/api/v1/metrics/*
  ↓
PlatformServiceGateway.metrics.*
  ↓
RequestPipeline → Production Authorization
  ↓
Platform Metrics Services → Metrics Core → Persistence → PostgreSQL
```

HTTP handlers authenticate, build trusted `ServiceRequestContext`, validate with Zod, and invoke `gateway.metrics.*`. They never import `@apzhub/metrics-core`, `@apzhub/metrics-persistence`, repositories, or PostgreSQL.

## Surface

| Area            | Path prefix                                                         | Notes                             |
| --------------- | ------------------------------------------------------------------- | --------------------------------- |
| Metadata facets | `/api/v1/metrics/{facet}`                                           | 21 CRUD facets                    |
| Diagnostics     | `/api/v1/metrics/diagnostics/*`                                     | readiness / health / capabilities |
| Aliases         | `/health`, `/readiness`, `/capabilities`, `/management-diagnostics` | management plane                  |

## Bootstrap

`APZHUB_METRICS_ENABLED` — when false, handlers return `503 METRICS_SERVICE_UNAVAILABLE`. No silent fallback.

## Explicit exclusions

Formula/KPI execution, Prometheus/Grafana/OTel, analytics, dashboards, Workbench, Event Bus, AI.

## See also

- [Route Catalogue](../guides/APZHUB-Metrics-HTTP-Route-Catalogue.md)
- [Typed Client Guide](../guides/APZHUB-Metrics-Typed-Client-Guide.md)
- [APZMETRICS-003 Completion Report](../sprint/APZMETRICS-003-completion-report.md)
