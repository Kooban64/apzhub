# APZHUB Metrics HTTP Consumer Guide

**Milestone:** APZMETRICS-003

## For UI / Workbench consumers (future)

1. Use `createHttpMetricsClient()` from `apps/web/lib/metrics`
2. Prefer `metricsQueryKeys` for React Query
3. Handle `METRICS_SERVICE_UNAVAILABLE` (503)
4. Treat all entities as metadata — never assume calculated values

## Quality

```bash
pnpm audit:metrics-http-client
pnpm openapi:validate:platform
```

## Next milestone

**APZMETRICS-004 — Metrics Administration Workbench** (await owner approval).
