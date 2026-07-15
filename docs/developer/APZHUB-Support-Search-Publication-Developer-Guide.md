# Support Search Publication — Developer Guide

**Package:** `@apzhub/search-support` **0.1.0**

```ts
import {
  createSupportSearchAdapter,
  createSupportSearchPublicationContext,
} from "@apzhub/search-support";

const adapter = createSupportSearchAdapter();
const context = createSupportSearchPublicationContext({
  serviceContext: {
    tenantId: "…",
    userId: "…",
    correlationId: "…",
    permissions: ["support.read"],
    organisationId: "…",
  },
});

adapter.hooks.onSupportRequestUpserted(context, ticket);
```

## Boundaries

Depends on `@apzhub/search-integration`, `@apzhub/platform-service-contracts`, `@apzhub/search-contracts`.

Must not depend on Meilisearch, `platform-services`, `integration-zammad`, HTTP, or Workbench.

```bash
pnpm audit:search-support
pnpm --filter @apzhub/search-support test
```
