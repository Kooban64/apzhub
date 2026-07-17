# APZHUB Platform Workflow HTTP API

**Milestone:** APZWORKFLOW-003  
**Base path:** `/api/v1/workflows`  
**Status:** Implemented — metadata / lifecycle only (no execution, n8n, schedules)

## Request path

```text
HTTP → withPlatformApiAuth → handlers/workflows.ts
  → PlatformServiceGateway.workflow.*
  → RequestPipeline (workflowPlatformOps)
  → Authorization (workflow.*)
  → Workflow Platform Services → Workflow Core
```

Handlers contain no business logic and must not import `@apzhub/workflow-core`, `@apzhub/workflow-persistence`, drizzle, or postgres.

## Endpoints (gateway-backed)

| Method | Path | Gateway |
|--------|------|---------|
| GET | `/` | `workflow.workflows.find` |
| POST | `/` | `workflow.workflows.create` |
| GET | `/{workflowId}` | `workflow.workflows.get` |
| PATCH | `/{workflowId}` | `workflow.workflows.update` |
| DELETE | `/{workflowId}` | `workflow.workflows.delete` |
| POST | `/{workflowId}/publish` | `workflow.workflows.publish` |
| POST | `/{workflowId}/archive` | `workflow.workflows.archive` |
| POST | `/{workflowId}/restore` | `workflow.workflows.restore` |
| POST | `/{workflowId}/transition` | `workflow.workflows.transition` |
| GET | `/{workflowId}/versions` | `workflow.versions.list` |
| POST | `/{workflowId}/versions` | `workflow.versions.create` |
| GET | `/{workflowId}/versions/{versionId}` | `workflow.versions.get` (+ belonging check) |
| GET | `/{workflowId}/audit` | `workflow.audit.list` |
| GET | `/templates` | `workflow.templates.list` |
| POST | `/templates` | `workflow.templates.create` |
| GET | `/templates/{templateId}` | `workflow.templates.get` |
| PATCH | `/templates/{templateId}` | `workflow.templates.update` |
| DELETE | `/templates/{templateId}` | `workflow.templates.delete` |
| GET | `/categories` | `workflow.categories.list` |
| POST | `/categories` | `workflow.categories.create` |
| GET | `/categories/{categoryId}` | `workflow.categories.get` |
| GET | `/folders` | `workflow.folders.list` |
| POST | `/folders` | `workflow.folders.create` |
| GET | `/folders/{folderId}` | `workflow.folders.get` |
| POST | `/validation` | `workflow.validation.validate` |

## Optional HTTP-only stubs (no gateway methods)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/capabilities` | Management DTO; `executionEnabled: false`, `engineConfigured: false` |
| GET | `/health` | Same plane + `status`/`healthy` |
| GET | `/readiness` | Same plane + `ready` |
| GET | `/diagnostics` | Same plane + bootstrap metadata |

When `APZHUB_WORKFLOW_ENABLED` is false → controlled **503** (`WORKFLOW_SERVICE_UNAVAILABLE`).

## Explicitly absent

`execute`, `runs`, `n8n`, `schedules`, `activate`, `deactivate`, version publish/archive/validate routes, category/folder PATCH/DELETE.

## Routing note

Static segments (`templates`, `categories`, `folders`, `validation`, `capabilities`, `health`, `readiness`, `diagnostics`) are **siblings** of `[workflowId]` under `app/api/v1/workflows/`.

## Enablement

- Env: `APZHUB_WORKFLOW_ENABLED=true|1|on`
- Bootstrap: `createWorkflowPlatformServicesForProduction({ postgresDb })` when enabled + `DATABASE_URL`
- Do **not** invent `WORKFLOW_SERVICE_ENABLED`
