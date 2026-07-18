# APZWORKFLOW-010 — Production Readiness

**Date:** 2026-07-15  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Certification:** APZWORKFLOW-010 (Workflow Engine vertical — read-only)

---

## Checklist

| Area                                                                            | Status                                           |
| ------------------------------------------------------------------------------- | ------------------------------------------------ |
| `@apzhub/integration-n8n` **0.1.0** (frozen, read-only)                         | ✅                                               |
| `@apzhub/workflow-contracts` **0.3.0** · `@apzhub/platform-services` **0.20.0** | ✅                                               |
| `gateway.workflow.engine.*` + RequestPipeline + Production Authorization        | ✅                                               |
| HTTP `/api/v1/workflows/engine/*` + OpenAPI **Workflow Engine** (1.3.0)         | ✅                                               |
| Typed client + mock + React Query keys                                          | ✅                                               |
| Workbench `/workspace/workflow-engine` + manifests                              | ✅                                               |
| Vertical audit `pnpm audit:workflow-engine-vertical`                            | ✅ 0 violations                                  |
| Prior audits 006–009                                                            | ✅                                               |
| Execution / scheduling / mutations / Event Bus / workers                        | ❌ Excluded by design                            |
| Designer / drag-and-drop                                                        | ❌ Excluded by design                            |
| Live n8n in CI                                                                  | ⚠️ Optional via `APZHUB_WORKFLOW_ENGINE_ENABLED` |
| Playwright / Next live webServer                                                | ⚠️ LIMITED (Testing slug conflict — external)    |

## Why PRODUCTION_READY_WITH_LIMITATIONS

The Workflow Engine vertical is complete end-to-end for **read-only metadata**: Workbench → client → HTTP → Gateway → RequestPipeline → Authz → Services → Integration SDK → n8n adapter. Boundary-audited and OpenAPI-validated. Absences of execution/scheduling/mutations are intentional product boundaries — the same class of limitation used for Workflow SoR (005), Search, Documents, and Reporting certifications.

## Why not unqualified PRODUCTION_READY

- No execution, scheduling, or workflow mutations
- Read-only adapter by design
- Live provider optional (explicit bootstrap)
- Playwright live environment dependent (external Testing slug conflict)

## Why not READY_WITH_LIMITATIONS / NOT_READY

All certified layers are implemented, audited, and regression-tested. Limitations are scope exclusions, not incomplete delivery of the intended read-only vertical.

## Frozen architecture

Do not add Workflow Engine execution, scheduling, mutations, Event Bus, workers, designer, credentials UI, or new HTTP/UI capabilities without a new approved milestone.

**Recommended next:** **APZWORKFLOW-011 — Workflow Engine Wave Certification & Reference Adapter Closeout** only.
