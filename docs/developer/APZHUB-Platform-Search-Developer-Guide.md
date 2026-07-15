# APZHUB Platform Search — Developer Guide

> **Milestone:** APZSEARCH-001  
> **Package:** `@apzhub/search-contracts` **0.1.0**

---

## Install / import

```ts
import {
  validateSearchQuery,
  PLATFORM_SEARCH_PERMISSIONS,
  FOUNDATION_SEARCH_CAPABILITIES,
  type SearchPlatformGateway,
  type ProductSearchAdapter,
  type SearchEngineProvider,
} from "@apzhub/search-contracts";
```

Zero runtime dependencies. TypeScript path alias is registered in `tsconfig.base.json`.

## Commands

```bash
pnpm --filter @apzhub/search-contracts typecheck
pnpm --filter @apzhub/search-contracts test
pnpm audit:search-foundation
```

## Platform services (contracts only)

| Facet | Interface |
|-------|-----------|
| Query | `PlatformSearchQueryService` (`validateQuery`; `query?` reserved) |
| Providers | `PlatformSearchProviderService` |
| Diagnostics | `PlatformSearchDiagnosticsService` |
| Configuration | `PlatformSearchConfigurationService` |

Aggregate type: `SearchPlatformGateway`.

## Do not

- Implement OpenSearch/Elasticsearch/Meilisearch/Typesense/Postgres FTS clients here
- Add `/api/v1/search` or Workbench routes in this milestone
- Store indexed document bodies in platform PostgreSQL as SoR
- Enable semantic/vector/fuzzy capabilities in foundation diagnostics
- Bypass tenant/org/permission checks in adapters

## Next

Await owner approval for **APZSEARCH-002 — Search Persistence & Provider Framework**.
