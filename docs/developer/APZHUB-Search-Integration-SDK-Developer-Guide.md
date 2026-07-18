# APZHUB Search Integration SDK — Developer Guide

| Field         | Value                                      |
| ------------- | ------------------------------------------ |
| **Package**   | `@apzhub/integration-search-sdk` **0.1.0** |
| **Milestone** | APZSEARCH-004                              |

## Install / workspace

The package is a private workspace member under `packages/integration-search-sdk`.

```ts
import {
  SEARCH_INTEGRATION_SDK_VERSION,
  createSearchAdapterFactory,
  createSearchIntegrationBootstrapConfiguration,
  MockSearchIntegrationAdapter,
  SearchOperationRunner,
  evaluateSearchCompatibility,
} from "@apzhub/integration-search-sdk";
```

## Key APIs

### Bootstrap

`createSearchIntegrationBootstrapConfiguration` → `AdapterBootstrapConfiguration` with `"search"`.

### Factory

- `createSearchAdapterFactory()`
- `.create(AdapterClass, options)`
- `.createMockAdapter(options)`
- `.dispose(adapter)`

### Context

`buildSearchAdapterContext` / `SearchAdapterContextBuilder` wrap `buildAdapterContext` and attach:

- `searchCapabilities`, `operationRunner`, `searchHealth`, `searchDiagnostics`
- `searchLifecycle`, `searchConfigurationValidator`
- `searchMetrics`, `searchLogger`, `searchErrorTranslator`, `searchCompatibility`

### Operations

All runner methods return `NOT_IMPLEMENTED`. Alias constant: `NOT_IMPLEMENTED`.

## Quality commands

```bash
pnpm --filter @apzhub/integration-search-sdk typecheck
pnpm exec vitest run packages/integration-search-sdk
pnpm exec vitest run --coverage \
  --coverage.include='packages/integration-search-sdk/src/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.test.ts' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=80 \
  --coverage.thresholds.statements=95 \
  packages/integration-search-sdk
pnpm audit:search-integration-sdk
```

## Related docs

- [Architecture](../architecture/APZHUB-Search-Integration-SDK-Architecture.md)
- [Capability model](../architecture/APZHUB-Search-Integration-Capability-Model.md)
- [Compatibility model](../architecture/APZHUB-Search-Integration-Compatibility-Model.md)
- [Adapter development](../guides/search-integration-adapter-development.md)
- [Lifecycle](../guides/search-integration-adapter-lifecycle.md)
