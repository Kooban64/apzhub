# OSS-110-07 — Platform HTTP API Surface — Completion Report

**Milestone:** OSS-110-07  
**Date:** 2026-07-10  
**Status:** Complete  
**Surface:** `/api/v1` in `apps/web`  
**ADR:** [ADR-0051](../adr/ADR-0051-platform-http-api-surface.md)  
**OpenAPI:** [APZHUB-Platform-OpenAPI-v1.yaml](../specs/APZHUB-Platform-OpenAPI-v1.yaml)

---

## Executive summary

OSS-110-07 delivers the first production-capable HTTP API over `PlatformServiceGateway`. Thin Next.js App Router handlers validate input, build trusted `ServiceRequestContext` from Better Auth sessions, and delegate to the gateway. Authorisation remains in `RequestPipeline` / production provider. No Plane imports in routes, no Task/User/Search production endpoints, no UI.

---

## Milestone scope delivered

| Deliverable | Status |
|-------------|--------|
| `/api/v1` foundation (envelope, validation, errors, logging) | ✅ |
| Request-context builder from trusted session | ✅ |
| Gateway process bootstrap + test override | ✅ |
| Workspaces / Projects / Teams routes | ✅ |
| Health + readiness | ✅ |
| OpenAPI 3.1 + validation command | ✅ |
| Architecture boundary tests | ✅ |
| Documentation + ADR-0051 | ✅ |
| Task / User / Search / UI / GraphQL | ⏸ Excluded |

---

## Architecture overview

See [Platform HTTP API](../architecture/APZHUB-Platform-HTTP-API.md).

---

## Routes delivered / excluded

See architecture doc tables. DELETE project → `archiveProject` (soft-retire).

---

## API versioning approach

Path `/api/v1` per ADR-0051.

---

## Request and response standards

`data`/`page`/`meta` success; `error`/`meta` failure. Correlation + request IDs on meta and response headers.

---

## Authentication / authorisation integration

Better Auth session → context; pipeline enforces permissions. No duplicate permission checks in routes.

---

## Tenant and organisation enforcement

Tenant from session only. Cross-tenant global IDs denied via gateway/mapping (tests cover guessed IDs). Organisation not client-switchable.

---

## Gateway bootstrap behaviour

Singleton bootstrap; production forbids silent allow-all / memory mapping; Plane optional via `PLANE_INTEGRATION_ENABLED`.

---

## Validation / pagination

Zod strict schemas; max page size 100; unsupported query/body fields rejected.

---

## HTTP error mapping

Central `mapPlatformErrorToHttpStatus` — see architecture doc.

---

## OpenAPI status

Valid OpenAPI 3.1; paths match delivered routes; tasks absent. `pnpm openapi:validate:platform`.

---

## Files created (primary)

| Path | Role |
|------|------|
| `apps/web/lib/api/v1/**` | HTTP foundation, handlers, gateway bootstrap, tests |
| `apps/web/app/api/v1/**` | Route handlers |
| `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` | OpenAPI |
| `docs/architecture/APZHUB-Platform-HTTP-API.md` | Architecture |
| `docs/adr/ADR-0051-*.md` | Decision |
| `docs/sprint/OSS-110-07-completion-report.md` | This report |

---

## Files modified (primary)

| Path | Change |
|------|--------|
| `apps/web/middleware.ts` | `/api/v1` JSON auth path (no HTML redirect) |
| `apps/web/package.json` | platform-services, contracts, plane, authz, zod |
| `packages/platform-security/.../paths.ts` | Traffic governance for `/api/v1` |
| Foundation indexes, CHANGELOG, `.env.example` | Closeout |

---

## Tests added

`apps/web/lib/api/v1/platform-api.v1.test.ts` — **19** tests (routes, validation, auth context, tenancy, errors, OpenAPI, architecture boundaries).

---

## Total test statistics (closeout)

| Suite | Result |
|-------|--------|
| Platform API v1 | 19 passed |
| platform-services + contracts + API | **149** passed |
| Typecheck `@apzhub/web` | Pass |
| OpenAPI validate | Pass |

---

## Security test results

Cross-tenant denial · guessed global ID · no Plane imports in routes · no sensitive error leakage · session-trusted tenant only.

---

## Coverage / quality gates

Lint/typecheck/tests for affected packages green. OpenAPI validated.

---

## Backward compatibility

Existing `/api/platform/v1` and `/api/law/v1` unchanged. New `/api/v1` additive.

---

## Deployment considerations

1. Set production authz + postgres mapping env (OSS-110-05/06).  
2. Enable Plane only when configured (`PLANE_INTEGRATION_ENABLED`).  
3. Ensure session cookies work for API clients (same-origin).  
4. Do not expose interactive Swagger UI in production without policy approval.

---

## Technical debt

- Durable idempotency store not implemented (header validated only).  
- Project domain has no revision field — optimistic concurrency deferred.  
- In-memory authorization service used in HTTP bootstrap access resolver until composition root wires postgres authorization.  
- User/Search routes deferred until providers are real.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Empty provider registry when Plane disabled | Readiness reports `providers: unregistered` |
| Authz seed incomplete for live users | Fail closed via production provider |

---

## Recommendation for the next milestone

Suggested **OSS-101-06 Task board** (after TaskServiceImpl) **or** wire postgres authorization into HTTP bootstrap — only with explicit owner approval.

---

## Stop condition

**OSS-110-07 complete.** Do not begin OSS-101-06, TaskServiceImpl, UI, or OSS-110-08 without owner approval.
