# APZHUB Testing HTTP API

**Purpose:** Document the APZ TCMS HTTP API surface delivered in APZTCMS-012.  
**Audience:** Platform engineers, Testing workbench maintainers, AI agents.  
**Authority:** [010 API Gateway Standards](../010-api-gateway-integration-communication-standards.md) · [Testing Gateway Reference](./APZHUB-Testing-Gateway-Reference.md) · [Platform HTTP API](./APZHUB-Platform-HTTP-API.md)  
**Status:** Implemented — APZTCMS-012 complete.  
**Last updated:** 2026-07-12

---

## Summary

APZTCMS-012 exposes APZ TCMS through `/api/v1/testing/**` route handlers. The handlers live in `apps/web/lib/api/v1/handlers/testing.ts`; App Router files live under `apps/web/app/api/v1/testing/` and currently cover 69 route files.

Request path:

```text
Client → /api/v1/testing route → auth/session → ServiceRequestContext
  → gateway.testing.* → RequestPipeline → Testing platform service
  → testing domain service → persistence
```

Handlers validate inputs with `apps/web/lib/api/v1/schemas/testing.ts`, return the standard v1 envelope, and never import `@apzhub/testing-services` or `@apzhub/testing-persistence` directly.

---

## Route Families

- Plans, suites, cases, requirements.
- Manual executions and execution step updates.
- Evidence metadata registration and lifecycle commands.
- Automation result validation/import history/coverage metadata.
- Coverage, defects, quality summaries/trends/regression.
- Release readiness calculations, always advisory (`isDecision: false`).
- Certification records, gate evaluation, recommendations, approvals, audit.
- Traceability links and dashboard summary.

The quality risk endpoint intentionally returns capability unsupported (`501`) until the platform contract adds a risk-specific API.

---

## Boundaries

- Evidence routes are JSON metadata only; no multipart or binary upload route exists.
- Automation imports parse/validate result payloads; they do not run tests.
- Release readiness and certification recommendations are advisory and never auto-approve.
- No Event Bus, AI, live runners, notifications, or binary storage wiring was added in APZTCMS-012.

---

## Verification

- Focused Vitest: `20` files, `139` tests passed.
- OpenAPI validation: `pnpm openapi:validate:platform`.
- Architecture tests scan handlers/routes for forbidden testing service or persistence imports.
