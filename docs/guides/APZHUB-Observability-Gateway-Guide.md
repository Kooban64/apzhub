# Observability Gateway Guide

**Milestone:** APZOBSERVE-002

## Access

```ts
bundle.gateway.observe.healthChecks.list(ctx)
bundle.gateway.observe.metricDefinitions.create(ctx, input)
bundle.gateway.observe.diagnostics.readiness(ctx)
```

## Facets

`healthChecks` · `readinessChecks` · `livenessChecks` · `serviceHealth` · `serviceStatus` · `componentStatus` · `metricDefinitions` · `metricSamples` · `alertDefinitions` · `alertStates` · `dashboardDefinitions` · `logSources` · `traceDefinitions` · `traceSpans` · `incidentReferences` · `maintenanceWindows` · `healthSummaries` · `metadata` · `diagnostics`

Each CRUD facet exposes `list` / `get` / `create` / `update` (metadata only).

`diagnostics` also exposes platform `health` / `readiness` / `capabilities` (no external provider probes).

## Rules

- Single canonical `PlatformServiceGateway` — no second gateway
- All calls pass `RequestPipeline` + production authorization
- Disabled when observe bundle is not wired (`PROVIDER_CAPABILITY_UNSUPPORTED`)
