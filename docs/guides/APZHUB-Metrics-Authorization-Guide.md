# APZHUB Metrics Authorization Guide

**Milestone:** APZMETRICS-002

## Permissions

`PLATFORM_METRICS_PERMISSIONS` from `@apzhub/metrics-contracts`, spread into the platform catalogue:

- `metrics.*`
- `metrics.read` / `metrics.manage`
- `metrics.definition` / `metrics.kpi`
- `metrics.metadata` / `metrics.classification` / `metrics.retention`

## Operation catalogue

`metricsPlatformOps` maps RequestPipeline service keys (e.g. `metricsMetrics`, `metricsDefinitions`, `metricsKpis`, `metricsDiagnostics`) to granular permissions. Deny-by-default — no production allow-all.
