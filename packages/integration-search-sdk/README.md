# `@apzhub/integration-search-sdk` — Search Integration SDK (APZSEARCH-004)

Vendor-neutral Search Integration SDK for APZHUB. Extends `@apzhub/integration-sdk` with search-specific adapter contracts, capability declarations, lifecycle helpers, and diagnostics — **without** binding any search engine.

**Version:** `0.1.0`  
**Depends on:** `@apzhub/integration-sdk` `0.9.0`, `@apzhub/search-contracts` `0.3.0`

## What this package is

- Abstract `SearchIntegrationAdapterBase` for future engine adapters
- Declarative capability model (keyword, facets, health, …)
- Operation ports that return `NOT_IMPLEMENTED` (no execution)
- Mock adapter for unit tests
- Compatibility / health / diagnostics helpers (safe metadata only)

## What this package is not

- No OpenSearch / Meilisearch / Elasticsearch / Typesense / Postgres FTS / Azure AI Search clients
- No HTTP routes, Workbench UI, indexing, or query execution
- No AI / OCR / vector / semantic search
- No Event Bus or workers

## Quick start

```ts
import {
  createSearchAdapterFactory,
  createMockSearchAdapterBootstrap,
  MockSearchIntegrationAdapter,
} from "@apzhub/integration-search-sdk";

const factory = createSearchAdapterFactory();
const { adapter } = await factory.createMockAdapter({
  configuration: createMockSearchAdapterBootstrap(),
});

const result = await adapter.executeQuery(ctx, { keywords: "hello" });
// result.status === "NOT_IMPLEMENTED"
```

## Package layout

| Path                 | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `src/adapter/`       | Base, factory, context, bootstrap               |
| `src/capabilities/`  | Declarative capability constants + registration |
| `src/contracts/`     | Operation ports + `NOT_IMPLEMENTED` runner      |
| `src/errors/`        | `SearchErrorTranslator`                         |
| `src/health/`        | `SearchProviderHealth`                          |
| `src/diagnostics/`   | `SearchProviderDiagnostics`                     |
| `src/lifecycle/`     | Lifecycle + configuration validator             |
| `src/observability/` | Metrics / logger wrappers                       |
| `src/compatibility/` | Compatibility report                            |
| `src/testing/`       | `MockSearchIntegrationAdapter`                  |

## Subpath exports

- `@apzhub/integration-search-sdk`
- `@apzhub/integration-search-sdk/adapter`
- `@apzhub/integration-search-sdk/capabilities`
- `@apzhub/integration-search-sdk/errors`
- `@apzhub/integration-search-sdk/health`
- `@apzhub/integration-search-sdk/diagnostics`
- `@apzhub/integration-search-sdk/testing`

## Scripts

```bash
pnpm --filter @apzhub/integration-search-sdk typecheck
pnpm exec vitest run packages/integration-search-sdk
pnpm audit:search-integration-sdk
```

## Docs

- [Architecture](../../docs/architecture/APZHUB-Search-Integration-SDK-Architecture.md)
- [Adapter development guide](../../docs/guides/search-integration-adapter-development.md)
- [Developer guide](../../docs/developer/APZHUB-Search-Integration-SDK-Developer-Guide.md)
