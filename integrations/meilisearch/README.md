# `@apzhub/integration-meilisearch` — Meilisearch Reference Adapter (APZSEARCH-005)

| Field          | Value                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Package**    | `@apzhub/integration-meilisearch` **0.1.0**                                               |
| **Path**       | `integrations/meilisearch/`                                                               |
| **Milestone**  | APZSEARCH-005                                                                             |
| **Depends on** | `@apzhub/integration-sdk` · `@apzhub/integration-search-sdk` · `@apzhub/search-contracts` |

## Purpose

Certified **reference search engine adapter** for Meilisearch Community Edition (self-hosted OSS). Extends `SearchIntegrationAdapterBase` and speaks Meilisearch HTTP via a raw `MeilisearchRestClient` — **no** `meilisearch` npm client.

The Search Platform (APZSEARCH-001–004) remains **vendor-neutral**. OpenSearch and other engines remain future adapter options.

## Supported

Keyword/phrase query · pagination · sorting · filters · facets · highlighting · index CRUD · document CRUD · health · diagnostics · statistics · configuration validation · capabilities

## Not supported (`NOT_SUPPORTED`)

Semantic · vector · fuzzy · AI ranking · OCR

## Quick start

```ts
import {
  createMeilisearchAdapter,
  createMockMeilisearchFetch,
} from "@apzhub/integration-meilisearch";

const { adapter } = await createMeilisearchAdapter({
  meilisearch: {
    baseUrl: "http://127.0.0.1:7700",
    apiKeyRef: "meilisearch/api-key",
    defaultIndexUid: "documents",
  },
  tenantId: "tenant-1",
  apiKey: "secret-from-vault", // materialised via SecretProvider only
  fetchFn: createMockMeilisearchFetch(), // tests — never live Meilisearch in CI
});

const page = await adapter.search(
  {
    correlationId: "c1",
    tenantId: "tenant-1",
    actorUserId: "u1",
    permissions: ["search.query"],
  },
  { keywords: "projects", page: 1, pageSize: 20 },
);
```

## Quality

```bash
pnpm --filter @apzhub/integration-meilisearch typecheck
pnpm exec vitest run integrations/meilisearch
pnpm audit:meilisearch-adapter
```

## Docs

- [Architecture](../../docs/architecture/APZHUB-Meilisearch-Adapter-Architecture.md)
- [Developer guide](../../docs/developer/APZHUB-Meilisearch-Adapter-Developer-Guide.md)
- [Configuration](../../docs/guides/meilisearch-adapter-configuration.md)
- [ADR-0060](../../docs/adr/ADR-0060-meilisearch-reference-search-adapter.md)
