# APZHUB Meilisearch Adapter Developer Guide

| Field        | Value                                       |
| ------------ | ------------------------------------------- |
| **Package**  | `@apzhub/integration-meilisearch` **0.1.0** |
| **Audience** | Adapter / platform engineers                |

## Create an adapter

```ts
import { createMeilisearchAdapter } from "@apzhub/integration-meilisearch";

const { adapter, factory } = await createMeilisearchAdapter({
  meilisearch: {
    baseUrl: process.env.MEILI_URL ?? "http://127.0.0.1:7700",
    apiKeyRef: "meilisearch/api-key",
    defaultIndexUid: "documents",
  },
  tenantId: "tenant-1",
  apiKey: process.env.MEILI_KEY, // tests / local only — production uses SecretProvider
});
```

## Execute a query

Prefer `adapter.search(...)` / `adapter.operations.*` for engine-backed results (`SearchOperationResult`: `OK` | `NOT_SUPPORTED` | `ERROR`). Inherited SDK ports remain declarative (`NOT_IMPLEMENTED`) for platform-neutral callers that have not opted into engine execution.

## Testing

```ts
import { createMockMeilisearchFetch } from "@apzhub/integration-meilisearch";

const fetchFn = createMockMeilisearchFetch({
  seedDocuments: {
    documents: [
      {
        id: "1",
        title: "Hello",
        tenantId: "t1",
        productId: "documents",
        sourceId: "src_meili",
      },
    ],
  },
});
```

Never point CI at a live Meilisearch instance for APZSEARCH-005 certification.

## Commands

```bash
pnpm --filter @apzhub/integration-meilisearch typecheck
pnpm exec vitest run integrations/meilisearch
pnpm exec vitest run --coverage \
  --coverage.include='integrations/meilisearch/src/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.test.ts' \
  integrations/meilisearch
pnpm audit:meilisearch-adapter
```
