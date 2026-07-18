# APZHUB Platform Search Persistence — Developer Guide

> **Milestone:** APZSEARCH-002

## Packages

| Package                      | Version |
| ---------------------------- | ------- |
| `@apzhub/search-contracts`   | 0.2.0   |
| `@apzhub/search-persistence` | 0.1.0   |

## Quick start (tests)

```ts
import { createSearchPlatformFoundationForTest } from "@apzhub/search-persistence";

const foundation = createSearchPlatformFoundationForTest({
  allowInMemoryPersistence: true,
});

await foundation.gateway.searchProviders.registerProvider?.(context, input);
```

## Production

```ts
const foundation = createSearchPlatformFoundationForProduction({
  postgresDb, // DatabaseExecutor — required
});
```

Production **never** falls back to in-memory.

## Commands

```bash
pnpm --filter @apzhub/search-persistence typecheck
pnpm --filter @apzhub/search-persistence test
pnpm audit:search-persistence
```

## Migrations

Apply `0041_apz_platform_search`, `0042_apz_platform_search_rls`, then `0043_apz_platform_search_management`.

## Gateway (APZSEARCH-003)

Compose via `@apzhub/platform-services`:

```typescript
import {
  createSearchPlatformServicesForTest,
  createPlatformServices,
} from "@apzhub/platform-services";

const searchPlatform = await createSearchPlatformServicesForTest({
  allowInMemoryPersistence: true,
});
const { gateway } = createPlatformServices({
  searchPlatform,
  authorizationMode: "allow-all",
});
await gateway.searchProviders.listProviders(ctx);
```

Production: `SEARCH_SERVICE_ENABLED=true` + `DATABASE_URL`.

## Next

Await owner approval for **APZSEARCH-004 — Search Provider Selection & Reference Engine Adapter**.
