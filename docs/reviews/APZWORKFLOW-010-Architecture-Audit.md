# APZWORKFLOW-010 — Architecture Audit

**Result:** PASS — 0 unexplained violations (`pnpm audit:workflow-engine-vertical` + prior 006–009)

## Path integrity

| Layer        | Evidence                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Workbench    | `apps/web/components/workflow-engine/*` → `@/lib/workflows/engine-api` + `workflowEngineQueryKeys` only                             |
| Typed client | `createHttpWorkflowEngineClient()` → `/api/v1/workflows/engine/*` only                                                              |
| HTTP         | Route handlers → `lib/api/v1/handlers/workflow-engine.ts` → `getPlatformServiceGateway().workflow.engine.*`                         |
| Gateway      | Nested `gateway.workflow.engine.{workflows,templates,tags,users,projects,capabilities,health,diagnostics,compatibility,connection}` |
| Pipeline     | Engine factory `wrapWithPipeline` / RequestPipeline on public ops                                                                   |
| Authz        | `workflowEngineOps` → `workflow.engine.{read,health,diagnostics,capabilities}`                                                      |
| Services     | Thin orchestration over Integration SDK adapter ports                                                                               |
| Adapter      | `@apzhub/integration-n8n` **0.1.0** — read-only metadata CE API                                                                     |
| Provider     | n8n — optional live; no silent production mock                                                                                      |

## Confirmed absences

No Gateway/Platform Service/adapter bypass from Workbench or typed client. No execution/schedule/activate/deactivate/webhooks/credentials routes. No second RequestPipeline/authz framework for the engine plane.
