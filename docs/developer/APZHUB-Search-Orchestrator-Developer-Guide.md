# Search Orchestrator Developer Guide

> **Milestone:** APZSEARCH-016  
> **Package:** `@apzhub/search-orchestrator` **0.1.0**

## Install / import

```ts
import {
  createProductionSearchOrchestration,
  createSearchOrchestrationForTest,
  withProjectSearchPublicationOrchestration,
  PRODUCT_HOOK_PRESETS,
  enqueueCreatePublication,
} from "@apzhub/search-orchestrator";
```

## Production bootstrap

```ts
const runtime = createProductionSearchOrchestration({
  postgresDb: db, // required — no in-memory fallback
  env: process.env, // APZHUB_SEARCH_ORCHESTRATION_ENABLED=true
});

// Drain periodically (worker / cron — not in request path for long work)
await runtime.orchestrator.processBatch();
```

## Product wiring (composition)

Do **not** edit frozen `@apzhub/platform-services`. Wrap at composition root:

```ts
const projects = withProjectSearchPublicationOrchestration(
  projectService,
  runtime.dispatcher,
);
```

Generic helpers: `enqueueCreatePublication`, `enqueueUpdatePublication`, `enqueueArchivePublication`, `enqueueRestorePublication`, `enqueueDeletePublication` with `PRODUCT_HOOK_PRESETS`.

## Boundaries

Publish **only** through `@apzhub/search-integration`.

Never import:

- `@apzhub/search-persistence`
- `@apzhub/search-contracts` (from orchestrator)
- `@apzhub/integration-meilisearch`
- Meilisearch client SDKs
- Search HTTP / Workbench

## Tests

```bash
pnpm --filter @apzhub/search-orchestrator test
pnpm audit:search-orchestrator
```

## Quality

Target ≥95% lines/functions on `packages/search-orchestrator/src/**`.
