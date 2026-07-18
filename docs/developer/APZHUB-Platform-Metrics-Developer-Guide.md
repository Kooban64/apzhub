# APZHUB Platform Metrics Developer Guide

**Milestone:** APZMETRICS-001

## Packages

```text
packages/metrics-contracts/
packages/metrics-core/
packages/metrics-persistence/
```

## Compose foundation (tests)

```ts
import {
  createMetricsFoundation,
  createMetricsDomainService,
} from "@apzhub/metrics-core";
import { createMetricsPersistenceForTest } from "@apzhub/metrics-persistence";

const repos = createMetricsPersistenceForTest({ allowInMemoryPersistence: true });
const foundation = createMetricsFoundation({ repos });
const service = createMetricsDomainService({ repos });
```

## Production persistence

```ts
import { createProductionMetricsPersistence } from "@apzhub/metrics-persistence";

const repos = createProductionMetricsPersistence({ db }); // db required — no fallback
```

## Quality commands

```bash
pnpm audit:metrics-foundation
pnpm exec vitest run --config vitest.config.ts \
  packages/metrics-contracts packages/metrics-core packages/metrics-persistence \
  testing/metrics-foundation
```

## Do not

- Call providers / HTTP / Gateway from these packages
- Evaluate formulas or KPIs
- Import `@apzhub/platform-services` from foundation packages
- Start APZMETRICS-002 without owner approval
