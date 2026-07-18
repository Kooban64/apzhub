# APZWORKFLOW-002 Completion Report

**Milestone:** APZWORKFLOW-002 — Workflow Platform Services, Gateway & Authorization  
**Status:** COMPLETE  
**Date:** 2026-07-15  
**Next:** **APZWORKFLOW-003 — Workflow HTTP API & Typed Client** (**await owner approval — do not start**)

---

## Executive Summary

Wired Workflow Platform domain into existing `PlatformServiceGateway` as nested `gateway.workflow.*` facets with production RequestPipeline authorisation. Business logic remains in `@apzhub/workflow-core`; platform-services are thin wrappers. No HTTP, n8n, execution, Event Bus, workers, or second gateway.

## Versions

| Package                              | Version                    |
| ------------------------------------ | -------------------------- |
| `@apzhub/workflow-contracts`         | **0.2.0**                  |
| `@apzhub/workflow-core`              | **0.1.1**                  |
| `@apzhub/workflow-persistence`       | **0.1.1**                  |
| `@apzhub/platform-services`          | **0.19.0**                 |
| `@apzhub/platform-service-contracts` | **0.16.0** (workflow stub) |

## Gateway shape

```text
gateway.workflow.workflows
gateway.workflow.versions
gateway.workflow.templates
gateway.workflow.categories
gateway.workflow.folders
gateway.workflow.validation
gateway.workflow.audit
```

## Authorization

- `PLATFORM_WORKFLOW_PERMISSIONS` (incl. `workflow.validation`) in platform catalogue
- `workflowPlatformOps` maps each facet method → permission
- Production AuthorizationProvider path only (no allow-all in production)

## Bootstrap

- `createWorkflowPlatformServicesForProduction` requires PostgreSQL
- `createWorkflowPlatformServicesForTest` requires `allowInMemoryPersistence` without db

## Quality gates

| Gate                                                   | Result                |
| ------------------------------------------------------ | --------------------- |
| `pnpm audit:workflow-platform-services`                | PASS                  |
| Typecheck / lint / test (workflow + platform packages) | PASS                  |
| Scoped coverage on `services/workflow/**`              | See coverage baseline |

## Explicit exclusions

HTTP, REST, OpenAPI, Workbench, n8n, execution, Event Bus, workers, scheduling, AI, notifications, second gateway.

## Recommendation

**APZWORKFLOW-003 — Workflow HTTP API & Typed Client** only. Do **not** implement until explicit owner approval.

**APZSEARCH-016** remains deferred.

---

**Stop condition met.** Await explicit owner approval before APZWORKFLOW-003.
