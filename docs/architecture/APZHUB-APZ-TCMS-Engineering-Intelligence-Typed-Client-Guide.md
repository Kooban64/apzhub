# APZHUB APZ TCMS — Engineering Intelligence Typed Client Guide (APZTCMS-022)

## Purpose

Production typed client for Engineering Intelligence HTTP APIs. Presentation only — no domain access.

## Factory

```ts
import { createHttpEngineeringIntelligenceClient } from "@/lib/testing";

const client = createHttpEngineeringIntelligenceClient();
```

In `NODE_ENV=test`, `engineering-intelligence-api` uses `createMockEngineeringIntelligenceClient()` by default.

## Operations

| Method | HTTP |
|---|---|
| `getScore` / `scoreWithScope` | GET/POST `/score` |
| `getHealth` / `assessHealth` | GET/POST `/health` |
| `getRisk` | GET `/risk` |
| `listSnapshots` / `getSnapshot` / `computeSnapshot` | GET/GET/POST `/snapshots` |
| `listTrends` / `buildTrend` | GET/POST `/trends` |
| `listBenchmarks` / `compareBenchmark` | GET/POST `/benchmarks` |
| `listBaselines` | GET `/baselines` |
| `listHistorical` | GET `/historical` |

## Constraints

- Paths must start with `/testing/engineering-intelligence`
- Credentials included; correlation ID optional via request options
- Errors map to `EngineeringIntelligenceClientError` with user-safe messages
- Facade: `getEngineeringQualityScore`, `listEngineeringTrends`, etc. via `@/lib/testing/testing-api`
