# APZHUB Metrics Typed Client Guide

**Milestone:** APZMETRICS-003  
**Package path:** `apps/web/lib/metrics`

## API

```ts
import {
  createHttpMetricsClient,
  createMockMetricsClient,
  getMetricsClient,
  metricsQueryKeys,
} from "@/lib/metrics";

const client = createHttpMetricsClient();
await client.metrics.list({ limit: 20 });
await client.kpis.get(id);
await client.diagnostics.health();
```

## Constraints

- Consumes **only** `/api/v1/metrics`
- Never imports Gateway, Platform Services, Metrics Core, or Persistence
- `createMockMetricsClient()` for tests
- `metricsQueryKeys` for TanStack Query

## Forbidden client paths

Prometheus, Grafana, OTel, execute/evaluate/calculate, scrape/ingest, secrets/credentials, dashboards/analytics/reports.
