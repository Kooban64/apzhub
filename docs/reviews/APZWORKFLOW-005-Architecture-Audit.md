# APZWORKFLOW-005 — Architecture Audit

**Result:** PASS — 0 unexplained violations (vertical audit + prior 001–004)

## Path integrity

| Layer        | Evidence                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Workbench    | `apps/web/components/workflows/*` → `@/lib/workflows/workflow-api` only                        |
| Typed client | `createHttpWorkflowClient()` → `/api/v1/workflows/*` only                                      |
| HTTP         | Route handlers → `lib/api/v1/handlers/workflows.ts` → `getPlatformServiceGateway().workflow.*` |
| Gateway      | Nested `gateway.workflow.{workflows,versions,templates,categories,folders,validation,audit}`   |
| Pipeline     | Public gateway ops wrapped by RequestPipeline (platform-services)                              |
| Authz        | `PLATFORM_WORKFLOW_PERMISSIONS` + `workflowPlatformOps`                                        |
| Services     | Thin delegation into Workflow Core / persistence ports                                         |
| Core         | Structural/lifecycle/version validation — no external calls                                    |
| Persistence  | PostgreSQL repositories + in-memory test implementations; migrations 0044/0045                 |

## Confirmed absences

No second gateway, RequestPipeline, or authz framework for Workflow. No n8n / execution engine package dependency. No circular deps across contracts → core → persistence → platform-services → apps.
