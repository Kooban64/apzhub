# APZHUB Metrics Administration Workbench Architecture

**Milestone:** APZMETRICS-004  
**Route:** `/workspace/metrics`  
**Capability:** `platform-metrics`  
**Activity Bar order:** 55  
**Permission:** `metrics.read`

---

## Architecture

```text
Metrics Administration Workbench
  ↓
Metrics Typed Client (apps/web/lib/metrics)
  ↓
/api/v1/metrics/*
  ↓
gateway.metrics.* → RequestPipeline → Production Authorization
  ↓
Platform Metrics Services → Metrics Core → Persistence → PostgreSQL
```

No App Router tree under `apps/web/app/workspace/metrics`. Catch-all workspace route mounts `MetricsWorkspaceRouter`.

## Registration

Manifests under `packages/workbench-framework/manifests/platform-metrics*` — parent Activity Bar + sidebar children for every canonical facet.

## Explicit exclusions

Formula/KPI execution, analytics, reporting, dashboards, Prometheus/Grafana/OTel, Event Bus, AI, metric collection.
