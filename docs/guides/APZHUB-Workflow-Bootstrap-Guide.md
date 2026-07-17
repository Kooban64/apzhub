# APZHUB — Workflow Bootstrap Guide

**Milestone:** APZWORKFLOW-002  
**Date:** 2026-07-15

---

## Production

```ts
import {
  createPlatformServices,
  createWorkflowPlatformServicesForProduction,
} from "@apzhub/platform-services";

const workflow = createWorkflowPlatformServicesForProduction({
  postgresDb, // required — throws without db
});

const bundle = createPlatformServices({
  workflow,
  authorizationMode: "production", // or env-driven production provider
});

await bundle.gateway.workflow.workflows.find(ctx, {});
```

**Rules**

- `postgresDb` is mandatory — no silent in-memory fallback.
- Production authorisation must be configured (existing pipeline `AuthorizationProvider`).
- Do not call `createWorkflowPlatformServicesForTest` in production.

## Test

```ts
const workflow = createWorkflowPlatformServicesForTest({
  allowInMemoryPersistence: true, // required without postgresDb
});
const bundle = createPlatformServices({
  workflow,
  authorizationMode: "allow-all", // tests only
});
```

Without `postgresDb` and without `allowInMemoryPersistence: true`, the test factory throws.
