# APZHUB-PLATFORM-WORKFLOW-005 — Completion Report

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005  
> **Title:** Workflow HTTP API  
> **Classification:** PRODUCTION CODE  
> **Date:** 2026-07-19  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **HTTP API READY**

---

## Objective

Expose Workflow Platform Services through the canonical APZHUB HTTP API under `/api/v1/workflow`.

## Delivered

| Deliverable            | Location                                                           |
| ---------------------- | ------------------------------------------------------------------ |
| App Router routes      | `apps/web/app/api/v1/workflow/**` (15 route files)                 |
| Handlers / Zod schemas | `apps/web/lib/api/v1/handlers/workflow.ts` · `schemas/workflow.ts` |
| Gateway bootstrap      | Existing `APZHUB_WORKFLOW_ENABLED` + `workflowReadiness`           |
| OpenAPI                | `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` **1.12.0**            |
| Tests                  | `apps/web/lib/api/v1/platform-api.workflow.v1.test.ts`             |
| HTTP docs              | `docs/http/workflow/`                                              |
| Contracts additive     | `@apzhub/workflow-contracts` **0.4.2** (`listIntents`)             |
| Services               | `@apzhub/platform-services` **0.28.0** (runtime + AuthZ)           |

## Architecture compliance

- Handlers call **only** `gateway.workflow.*` (Platform Services).
- `integration-n8n` never imported in handlers/routes.
- Authorization via Platform Authorization + Request Pipeline operation map.
- Distinct from `/api/v1/workflows` (SoR) and `/api/v1/workflows/engine`.

## Quality gates

| Gate                          | Result       |
| ----------------------------- | ------------ |
| Vitest (workflow HTTP)        | **PASS** (7) |
| OpenAPI validate              | **PASS**     |
| TypeScript (`apps/web`)       | **PASS**     |
| Architecture (no handler→n8n) | **PASS**     |

## Prerequisites closed by Owner Decision (this authorisation)

| Programme                    | Status after Owner Decision                                                    |
| ---------------------------- | ------------------------------------------------------------------------------ |
| APZHUB-PLATFORM-WORKFLOW-004 | **ACCEPTED / CLOSED** (Owner Decision accompanying WORKFLOW-005 authorisation) |

## STOP

Do **not** implement:

- Workflow Workbench
- Commercial APZ Workflow features

Await explicit Owner Acceptance of this programme; further product work requires new named Approval.
