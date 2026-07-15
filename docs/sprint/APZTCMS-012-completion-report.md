# APZTCMS-012 Completion Report

**Milestone:** APZTCMS-012 — Testing HTTP API, OpenAPI & Production Typed Client  
**Status:** COMPLETE  
**Date:** 2026-07-12  
**Next:** APZTCMS-013 — Vertical-Slice Certification & Production Readiness

---

## Delivered

- `/api/v1/testing/**` route family, backed by `apps/web/lib/api/v1/handlers/testing.ts` and **73** route files under `apps/web/app/api/v1/testing/`.
- Gateway-only dependency path: Workbench → typed HTTP client → `/api/v1/testing/*` → `PlatformServiceGateway.testing.*` → RequestPipeline → platform services → domain → PostgreSQL.
- Resources: requirements, plans, suites, cases, executions (+ steps/commands), evidence metadata, automation imports, coverage, defects, quality, release readiness (`isDecision: false`), certifications (human approve), approvals (read), traceability, dashboard.
- OpenAPI paths for key Testing resources validated through the platform OpenAPI document.
- Mock gateway fixtures extended with `gateway.testing.*` facets for plans, suites, cases, requirements, executions, evidence, automation, coverage, defects, quality, certification, release readiness, traceability, approvals, and dashboard.
- Production typed client: `createHttpTestingClient()` is the default outside `NODE_ENV=test`; mock client is retained for deterministic tests.
- HTTP client tests for URL construction, envelope parsing, error conversion, abort signals, and `credentials: "include"`.
- Architecture boundary tests for UI/service separation, route handler imports, `/api/v1/testing` client scope, no multipart/binary evidence route, and no AI folders.
- Mock-based Playwright coverage for opening the Testing workbench and listing plans through `/api/v1/testing/**`.
- Architecture docs for the Testing HTTP API, typed client, migration, security/privacy, and certification API.

---

## Verification

- Focused Vitest: `20` files passed, `139` tests passed.
- OpenAPI validation: `pnpm openapi:validate:platform`.

---

## Package Versions

- `@apzhub/testing-contracts`: unchanged `0.6.0`.
- `@apzhub/testing-persistence`: unchanged `0.7.0`.
- `@apzhub/testing-services`: unchanged `0.5.0`.
- Platform packages remain `0.8.0`.

---

## Explicit Non-Goals

No AI Assist, binary evidence upload, live runners, Event Bus, notifications, webhook ingress, or automatic certification decisions were added.

## Technical debt

- `listReleaseReadiness` / reports / admin settings on the typed client return empty collections where collection HTTP endpoints are not available.
- Case review/approve/reject/deprecate map through `transitionStatus` rather than dedicated domain verbs.
- Pre-existing web typecheck noise (Plane/Zammad harness / unrelated component tests) may remain — not introduced by APZTCMS-012.
- Full vertical-slice certification (end-to-end production readiness classification) deferred to APZTCMS-013.

## Recommended APZTCMS-013

**Testing Vertical-Slice Certification & Production Readiness** — add no new product features; certify Workbench → typed client → HTTP → Gateway → domain → PostgreSQL; API/OpenAPI parity; authz/tenancy; accessibility; performance baselines; production-readiness classification.

Await explicit owner approval before APZTCMS-013.

---

## Stop Condition

APZTCMS-012 is complete. Stop before APZTCMS-013 until owner approval.
