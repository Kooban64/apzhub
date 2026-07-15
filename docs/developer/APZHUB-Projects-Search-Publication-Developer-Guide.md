# Projects Search Publication — Developer Guide

**Package:** `@apzhub/search-projects` **0.1.0**

## Usage

```ts
import {
  createProjectsSearchAdapter,
  createProjectsSearchPublicationContext,
} from "@apzhub/search-projects";

const adapter = createProjectsSearchAdapter(); // memory sink by default

const context = createProjectsSearchPublicationContext({
  serviceContext: {
    tenantId: "…",
    userId: "…",
    correlationId: "…",
    permissions: ["projects.read"],
    organisationId: "…",
  },
});

adapter.hooks.onProjectUpserted(context, project);
adapter.publisher.preview(context, { entityType: "task", entity: task });
```

## Boundaries

Depends on:

- `@apzhub/search-integration`
- `@apzhub/platform-service-contracts`
- `@apzhub/search-contracts` (errors / classification)

Must not depend on Meilisearch, `platform-services`, `integration-plane`, HTTP, or Workbench.

## Audit

```bash
pnpm audit:search-projects
pnpm --filter @apzhub/search-projects test
```
