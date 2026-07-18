# APZWORKFLOW-008 Completion Report

**Milestone:** APZWORKFLOW-008 — n8n HTTP API & Production Typed Client  
**Status:** COMPLETE  
**Date:** 2026-07-15  
**OpenAPI:** Platform API **1.3.0** · tag **Workflow Engine**  
**Next:** **APZWORKFLOW-009 — n8n Workbench Integration** (**await owner approval — do not start**)

---

## Executive Summary

Exposed certified `gateway.workflow.engine.*` Platform Services through `/api/v1/workflows/engine/*` with OpenAPI documentation and production typed client `createHttpWorkflowEngineClient()`. Read-only only. No Workbench, execution, scheduling, mutations, or Event Bus.

## Architecture

```text
HTTP → Gateway → RequestPipeline → Authorization → Platform Services → n8n Adapter → n8n
```

Handlers call `getPlatformServiceGateway().workflow.engine.*` exclusively.

## HTTP API

Twelve authenticated GET routes under `/api/v1/workflows/engine` covering workflows, templates, tags, users, projects, capabilities, health, diagnostics, compatibility, and validate.

## OpenAPI

Tag **Workflow Engine**; paths `/workflows/engine/*`; schemas for core engine DTOs. Validated via `pnpm openapi:validate:platform`. Version bumped **1.2.0 → 1.3.0**.

## Typed Client

`createHttpWorkflowEngineClient()` in `apps/web/lib/workflows/engine-client.ts` — path-constrained to `/api/v1/workflows/engine`.

## Mock Client

`createMockWorkflowEngineClient()` + `engine-api.ts` selects mock automatically when `NODE_ENV=test`.

## Authorization

Unchanged Production Authorization catalogue from APZWORKFLOW-007 (`workflow.engine.*`). Enforced via RequestPipeline on gateway calls.

## Error Mapping

Platform errors → HTTP via existing platform API translator. Client maps envelopes → `WorkflowEngineClientError` (no provider/stack leakage).

## Security

Metadata only. Bootstrap engine wiring requires explicit `APZHUB_WORKFLOW_ENGINE_*` configuration — no silent mock in production.

## Tests

Handler, schema, typed client, mock, query keys, boundary, coverage suites. No live n8n.

## Coverage

Scoped engine HTTP/client façade: **~98%** lines/statements · **100%** functions · meaningful branches.

## Quality Gates

| Gate                                    | Result |
| --------------------------------------- | ------ |
| OpenAPI validate                        | PASS   |
| `pnpm audit:workflow-engine-http`       | PASS   |
| `pnpm audit:workflow-http-client` (003) | PASS   |
| Vitest engine suites                    | PASS   |
| Scoped coverage ≥95% lines/functions    | PASS   |

## Technical Debt

- Workbench surface deferred to 009
- Engine adapter off by default until `APZHUB_WORKFLOW_ENGINE_ENABLED`
- Pre-existing unrelated `@apzhub/web` typecheck noise outside this milestone’s files

## Recommendation

**APZWORKFLOW-009 — n8n Workbench Integration** only. Do **not** implement until explicit owner approval.

---

**Stop condition met.** Await owner approval before APZWORKFLOW-009.
