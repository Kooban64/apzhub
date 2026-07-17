# APZWORKFLOW-010 — Typed Client Certification

**Result:** PASS

## Factory

`createHttpWorkflowEngineClient()` in `apps/web/lib/workflows/engine-client.ts` — path-constrained to `/api/v1/workflows/engine`.

## Facades

`apps/web/lib/workflows/engine-api.ts` — module-level accessors; test env selects `createMockWorkflowEngineClient()`.

## Query keys

`workflowEngineQueryKeys` covers workflows, workflow, templates, projects, users, tags, capabilities, diagnostics, health, compatibility. No mutation keys.

## Boundaries

No Gateway, Platform Services, Integration SDK, or adapter imports in client/mock/keys layers.
