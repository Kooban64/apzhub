# APZHUB Cross-Product Search Integration — Developer Guide

**Package:** `@apzhub/search-integration` **0.1.0**  
**Milestone:** APZSEARCH-009

## Install / import

```ts
import {
  createSearchIntegration,
  createSearchIntegrationContext,
  ProjectsSearchPublicationContract,
} from "@apzhub/search-integration";
```

## Publish a canonical entity

```ts
const { publisher } = createSearchIntegration();

const context = createSearchIntegrationContext({
  productId: "projects",
  searchContext: {
    correlationId: "…",
    actorUserId: "…",
    tenantId: "…",
    organisationId: "…",
    permissions: [],
  },
});

const result = publisher.publish(context, {
  entityId: "prj_1",
  entityType: "project",
  title: "Alpha",
  summary: "…",
  metadata: { status: "active" },
  classification: "internal",
});
```

`preview` maps to platform `SearchMetadata` without writing the journal.  
`validate` does not mutate state.

## Product contracts

Contracts for Projects, Support, Documents, Testing (APZ TCMS), and Reporting are declared under `@apzhub/search-integration/products`. Implementing `toSearchEntityDraft` / `describeSources` is deferred — no product adapters in this milestone.

## Rules

- Never import Meilisearch or provider SDKs from product code for search publication.
- Never put provider keys in `metadata`.
- Tenant / product on the entity must match `SearchIntegrationContext`.

## Audit

```bash
pnpm audit:search-integration
pnpm --filter @apzhub/search-integration test
```
