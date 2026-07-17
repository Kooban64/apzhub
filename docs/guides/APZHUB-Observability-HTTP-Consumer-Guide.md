# Observability HTTP Consumer Guide

**Milestone:** APZOBSERVE-003

## Who consumes this API

- Future Observability Administration Workbench (APZOBSERVE-004)
- Platform operators / internal tools via typed client
- Automated tests (mock HTTP + mock client)

## Recommended usage

```ts
import {
  createHttpObserveClient,
  observeQueryKeys,
} from "@/lib/observe";

const client = createHttpObserveClient();
const checks = await client.healthChecks.list({ limit: 50 });
const caps = await client.getCapabilities();
// caps.providerExecutionEnabled === false
```

## React Query

Use `observeQueryKeys.*` for cache identity. Invalidate with `clearObserveQueries(queryClient)`.

## Enablement checklist

1. Set `APZHUB_OBSERVE_ENABLED=true`
2. Provide PostgreSQL for production bootstrap
3. Ensure caller session has the required `observe.*` permissions
4. Call only `/api/v1/observe/*` (typed client enforces this)

## Do not

- Build provider UIs that scrape Prometheus / query Loki / open Grafana APIs through this surface
- Store provider secrets in observe metadata payloads
- Bypass the typed client to call gateway or Platform Services from presentation code
