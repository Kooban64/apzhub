# APZHUB-PLATFORM-ANALYTICS-005 — Completion Report

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005  
> **Title:** Analytics HTTP API  
> **Classification:** PRODUCTION CODE  
> **Date:** 2026-07-19  
> **Status:** **ACCEPTED / CLOSED** (Owner Decision with ANALYTICS-006)

---

## Objective

Expose Analytics Platform Services through the canonical APZHUB HTTP API under `/api/v1/analytics`.

## Delivered

| Deliverable            | Location                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| App Router routes      | `apps/web/app/api/v1/analytics/**`                                      |
| Handlers / Zod schemas | `apps/web/lib/api/v1/handlers/analytics.ts` · `schemas/analytics.ts`    |
| Gateway bootstrap      | `apps/web/lib/api/v1/gateway/bootstrap.ts` (`APZHUB_ANALYTICS_ENABLED`) |
| OpenAPI                | `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` **1.11.0**                 |
| Tests                  | `apps/web/lib/api/v1/platform-api.analytics.v1.test.ts`                 |
| HTTP docs              | `docs/http/analytics/`                                                  |
| Contracts additive     | `@apzhub/analytics-contracts` **0.1.1**                                 |
| Services bump          | `@apzhub/platform-services` **0.28.0**                                  |

## Architecture compliance

- Handlers call **only** `gateway.analytics.*` (Platform Services).
- Metabase Integration imported **only** inside gateway bootstrap (dynamic), never in handlers/routes.
- Authorization via Platform Authorization + Request Pipeline operation map.
- Diagnostics / logging / metrics via existing platform API pipeline wrappers.

## Quality gates

| Gate                                           | Result   |
| ---------------------------------------------- | -------- |
| Vitest (analytics HTTP + contracts + services) | **PASS** |
| OpenAPI validate                               | **PASS** |
| Architecture (no handler→Metabase)             | **PASS** |

## STOP

Do **not** implement:

- Workbench Analytics Module
- APZ Analytics product

Await explicit Owner Acceptance of this programme; further product work requires new named Approval.
