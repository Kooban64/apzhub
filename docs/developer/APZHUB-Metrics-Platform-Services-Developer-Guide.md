# APZHUB Metrics Platform Services Developer Guide

**Milestone:** APZMETRICS-002

## Compose for tests

```ts
import {
  createMetricsPlatformServicesForTest,
  createPlatformServices,
} from "@apzhub/platform-services";

const metricsPlatform = createMetricsPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const bundle = createPlatformServices({
  metricsPlatform,
  authorizationMode: "allow-all", // tests only
});
await bundle.gateway.metrics.metrics.list(ctx);
```

## Quality

```bash
pnpm audit:metrics-platform-services
pnpm exec vitest run --config vitest.config.ts \
  packages/platform-services/src/services/metrics \
  testing/metrics-platform-services
```

## Do not

- Call Metrics Core from HTTP handlers (HTTP deferred to APZMETRICS-003)
- Evaluate formulas/KPIs
- Import provider SDKs into `services/metrics`
