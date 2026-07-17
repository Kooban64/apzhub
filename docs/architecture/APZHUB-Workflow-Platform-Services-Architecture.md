# APZHUB — Workflow Platform Services Architecture

**Milestone:** APZWORKFLOW-002 — Workflow Platform Services, Gateway & Authorization  
**Status:** Implemented  
**Date:** 2026-07-15  
**Packages:** `@apzhub/workflow-contracts` **0.2.0** · `@apzhub/workflow-core` **0.1.1** · `@apzhub/workflow-persistence` **0.1.1** · `@apzhub/platform-services` **0.19.0**

---

## Purpose

Expose the Platform Workflow domain through **Platform Services** and the existing **Platform Service Gateway**, with production **RequestPipeline** authorisation. Products consume `gateway.workflow.*` only — never persistence repos, n8n, or execution engines.

## Layering

```text
Product / future HTTP (`/api/v1/workflows` — APZWORKFLOW-003)
  → PlatformServiceGateway.workflow (nested facets)
      → RequestPipeline (authz via workflowPlatformOps)
          → Thin Workflow Platform Service impls
              → createPlatformWorkflowService (@apzhub/workflow-core)
                  → Persistence (@apzhub/workflow-persistence)
```

| Layer | Responsibility | Must not |
| ----- | -------------- | -------- |
| Gateway facets | Typed accessors, pipeline wrapping | Execution, n8n, HTTP |
| Platform service impls | Map `ServiceRequestContext` → domain; error translation | Business rules |
| Workflow Core | Domain CRUD, validation, lifecycle | HTTP, gateway, platform-services |
| Persistence | SoR metadata | Called from products |

## Gateway surface (`WorkflowPlatformGateway`)

| Facet | Pipeline service key | Role |
| ----- | -------------------- | ---- |
| `workflows` | `workflowWorkflows` | CRUD, find, publish, archive, restore, transition |
| `versions` | `workflowVersions` | Create / get / list immutable versions |
| `templates` | `workflowTemplates` | Template CRUD |
| `categories` | `workflowCategories` | Category create / get / list |
| `folders` | `workflowFolders` | Folder create / get / list |
| `validation` | `workflowValidation` | Structural / reference validation |
| `audit` | `workflowAudit` | List workflow audit entries |

Access via `gateway.workflow` (single nested getter — no second gateway).

## Factories

| Factory | Use |
| ------- | --- |
| `createWorkflowPlatformServices` | Compose from persistence bundle |
| `createWorkflowPlatformServicesForProduction` | Requires `postgresDb` — **no silent memory** |
| `createWorkflowPlatformServicesForTest` | Requires `allowInMemoryPersistence` or postgres |
| `wrapWorkflowPlatformGatewayWithPipeline` | Applied via `bundle.wrapWithPipeline(pipeline)` |

## Hard boundaries

- **No** execution / run / schedule / workers / queues
- **No** n8n, Event Bus, notifications, AI
- **No** REST / OpenAPI / Workbench
- **No** second gateway
- Workflow packages **must not** depend on `@apzhub/platform-services`

## See also

- [Workflow Gateway Architecture](./APZHUB-Workflow-Gateway-Architecture.md)
- [Workflow Authorization Guide](../guides/APZHUB-Workflow-Authorization-Guide.md)
- [Workflow Bootstrap Guide](../guides/APZHUB-Workflow-Bootstrap-Guide.md)
