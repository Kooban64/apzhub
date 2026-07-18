# Search Publication Admin Developer Guide

> **Milestone:** APZSEARCH-017  
> **Package:** `@apzhub/search-publication-admin` **0.1.0**

## Usage

```ts
import { createSearchPublicationAdmin } from "@apzhub/search-publication-admin";

const admin = createSearchPublicationAdmin({
  allowInMemoryOrchestration: true, // tests
  // or runtime: createProductionSearchOrchestration({ postgresDb })
});

await admin.gateway.listPublications(actor, { filter: { status: "failed" } });
```

## HTTP

Base: `/api/v1/search/publication`

Typed client: `createHttpSearchPublicationAdminClient()` in `apps/web/lib/search/publication-admin-client.ts`.

## Tests / audit

```bash
pnpm --filter @apzhub/search-publication-admin test
pnpm audit:search-publication-admin
```

## Boundaries

Do not import search-contracts, search-persistence, platform-services, Meilisearch from this package.
