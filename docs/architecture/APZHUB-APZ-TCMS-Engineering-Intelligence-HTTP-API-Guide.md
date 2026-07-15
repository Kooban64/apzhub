# APZHUB APZ TCMS — Engineering Intelligence HTTP API Guide (APZTCMS-022)

## Boundary

```
Client → /api/v1/testing/engineering-intelligence/* → withPlatformApiAuth → handlers
  → getPlatformServiceGateway().testing.engineeringIntelligence → Platform Services
```

Handlers never import `@apzhub/testing-services`, persistence, or adapters. No new analytics.

## Routes

| Method | Path | Gateway |
|---|---|---|
| GET | `/score` | `score` |
| POST | `/score` | `score` (optional scope/weights) |
| GET | `/health` | `assessHealth` |
| POST | `/health` | `assessHealth` (optional scope/weights) |
| GET | `/risk` | `assessHealth` → `risk` |
| GET | `/snapshots` | `listSnapshots` |
| POST | `/snapshots` | `computeSnapshot` |
| GET | `/snapshots/{snapshotId}` | `getSnapshot` |
| GET | `/trends` | `listTrends` |
| POST | `/trends` | `buildTrend` |
| GET | `/benchmarks` | `listBenchmarks` |
| POST | `/benchmarks` | `compareBenchmark` |
| GET | `/baselines` | `listBaselines` |
| GET | `/historical` | `listHistorical` |

Base path: `/api/v1/testing/engineering-intelligence`.

## Envelope

Single: `{ data, meta }` · Collection: `{ data, page, meta }`

OpenAPI tag: **Testing Engineering Intelligence** in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`.

Validate: `pnpm openapi:validate:platform`.
