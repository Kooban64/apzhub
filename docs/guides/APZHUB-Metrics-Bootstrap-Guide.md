# APZHUB Metrics Bootstrap Guide

**Milestone:** APZMETRICS-002

## Environment

| Variable                 | Effect                                                |
| ------------------------ | ----------------------------------------------------- |
| `APZHUB_METRICS_ENABLED` | `true` / `1` / `on` enables Metrics Platform Services |
| `DATABASE_URL`           | **Required** when Metrics is enabled (PostgreSQL)     |

## Behaviour

- Deny-by-default when unset/false
- Production factory requires explicit PostgreSQL — no silent in-memory fallback
- Bootstrap wires `metricsPlatform` into `createPlatformServices` and exposes `metricsEnabled` / `metricsReadiness`

## Note on naming

`CreatePlatformServicesInput.metrics` remains `PipelineMetrics` (telemetry). The Metrics SoR bundle is `metricsPlatform`. The gateway surface is still `gateway.metrics`.
