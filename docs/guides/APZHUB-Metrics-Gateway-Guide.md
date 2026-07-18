# APZHUB Metrics Gateway Guide

**Milestone:** APZMETRICS-002

## Access

```ts
const gateway = bundle.gateway.metrics;
await gateway.metrics.list(ctx);
await gateway.definitions.create(ctx, input);
await gateway.kpis.create(ctx, input);
await gateway.diagnostics.health(ctx);
```

## Facets

`metrics`, `definitions`, `versions`, `categories`, `groups`, `dimensions`, `labels`, `units`, `formulas`, `aggregations`, `thresholds`, `owners`, `consumers`, `retentionPolicies`, `classifications`, `dependencies`, `kpis`, `kpiGroups`, `kpiTargets`, `relationships`, `metadata`, `diagnostics`

Each metadata facet exposes `list` / `get` / `create` / `update`. Diagnostics exposes `health` / `readiness` / `capabilities` (metadata readiness only).

## Enablement

When Metrics is not bootstrapped, `gateway.metrics` throws `PROVIDER_CAPABILITY_UNSUPPORTED`.
