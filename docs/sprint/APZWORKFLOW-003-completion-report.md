# APZWORKFLOW-003 Completion Report

**Milestone:** APZWORKFLOW-003 — Workflow HTTP API & Production Typed Client  
**Status:** COMPLETE  
**Date:** 2026-07-15  
**Next:** **APZWORKFLOW-004 — Workflow Workbench** (**await owner approval — do not start**)

---

## Executive Summary

Exposed the existing Workflow Platform through `/api/v1/workflows`, OpenAPI (**Platform Workflow**, info **1.2.0**), and `createHttpWorkflowClient()` (+ mock). Thin HTTP only — maps 1:1 to `gateway.workflow.*`. No Workbench, n8n, execution, Event Bus, workers, or schedules.

## HTTP API

Gateway-only handlers under `/api/v1/workflows` covering workflows, versions, templates, categories, folders, validation, audit, plus optional HTTP-only management stubs.

Request path: HTTP → PlatformServiceGateway.workflow → RequestPipeline → Authorization → Platform Services → Workflow Core.

## OpenAPI

Tag **Platform Workflow** in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` (version **1.2.0**).  
`pnpm openapi:validate:platform` — required gate.

## Typed Client

`createHttpWorkflowClient()` in `apps/web/lib/workflows/` with mock client and accessor facades in `workflow-api.ts`.

## Bootstrap

`createWorkflowPlatformServicesForProduction` wired when `APZHUB_WORKFLOW_ENABLED` + `DATABASE_URL` (reuse `isWorkflowServiceEnabled` — no `WORKFLOW_SERVICE_ENABLED`).

## Testing

| Suite | Result |
| --- | --- |
| Vitest (handlers, client, boundary) | Required gate |
| OpenAPI validation | Required gate |
| Architecture audit `pnpm audit:workflow-http-client` | Required gate |
| Playwright | Not in scope (slug conflict LIMITED if encountered) |
| OpenAPI regression fix | Brittleness fixed: Task “plane” substring → vendor tokens; Platform API OpenAPI parse → `loadPlatformOpenApiSpecObject` (alias limit) |

## Explicit exclusions

Workbench UI, n8n, execution engines, Event Bus, workers, schedules, activate/deactivate named routes, category/folder PATCH/DELETE.

## Recommendation

**APZWORKFLOW-004 — Workflow Workbench** only. Do **not** implement until explicit owner approval.

---

**Stop condition met.** Await explicit owner approval before APZWORKFLOW-004.
