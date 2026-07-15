# OSS-110-12 Architecture Audit — Support Vertical Slice

> **Milestone:** OSS-110-12 — Support Vertical Slice Certification & Closeout  
> **Date:** 2026-07-11  
> **Verdict:** **PASS**  
> **Standard:** APZHUB Engineering Constitution (000) + Foundation Docs (001–029)

---

## Audit checklist

| # | Criterion | Verdict | Notes |
|---|-----------|---------|-------|
| 1 | HTTP routes delegate to handlers via `withPlatformApiAuth` | ✅ PASS | All 21 route files confirmed |
| 2 | Handlers call `getPlatformServiceGateway()` only — never adapters/connectors directly | ✅ PASS | No `@apzhub/integration-zammad` in handlers/routes/schemas |
| 3 | Handlers import from `@apzhub/platform-service-contracts` and `@/lib/api/v1/*` only | ✅ PASS | Boundary audit: 0 violations |
| 4 | Support service implementations in `platform-services` do not import integration package | ✅ PASS | `support-service-impls.ts`, `support-mapping-helpers.ts` clean |
| 5 | Zammad providers in `platform-services` delegate to `@apzhub/integration-zammad` — correct | ✅ PASS | Expected and correct dependency direction |
| 6 | Zammad providers do not import Next.js, apps/web, or database clients | ✅ PASS | No violations found |
| 7 | Module→Connector boundary never bypassed (no Module→Adapter coupling) | ✅ PASS | All calls go through Platform Service Gateway |
| 8 | Platform IDs returned to HTTP clients use `sreq_`, `sorg_`, `sgrp_`, `suser_`, `sart_` prefixes | ✅ PASS | Mapping store translates provider IDs to platform IDs |
| 9 | Provider-boundary IDs (`sreq_zammad_*`) are never returned to HTTP clients | ✅ PASS | `SupportServiceImpl` maps all outbound IDs |
| 10 | Entity mapping store accumulates entries with platform IDs (no `zammad` marker in `platformId`) | ✅ PASS | Verified in `support-vertical-stack.e2e.test.ts` |
| 11 | Permission catalogue contains all support.* permissions | ✅ PASS | 23+ support permissions catalogued |
| 12 | `OPERATION_AUTHORIZATION_MAPPINGS` maps all support HTTP operations to permissions | ✅ PASS | Verified in certification test suite |
| 13 | `createPlatformServicesWithZammad` registers all 8 support capabilities | ✅ PASS | Verified in gateway-only E2E |
| 14 | OpenAPI spec contains all support paths; no support-sync or support-webhooks | ✅ PASS | APZHUB-Platform-OpenAPI-v1.yaml confirmed |
| 15 | Article notes forced to `internal` visibility; replies forced to `public` | ✅ PASS | Handler enforces visibility regardless of request body |
| 16 | Cross-tenant isolation: mapping store uses tenant-scoped lookups | ✅ PASS | Tenant B cannot resolve Tenant A's platform IDs |
| 17 | No webhook ingress, Event Bus, binary attachments, or persistent sync in HTTP layer | ✅ PASS | Out-of-scope features absent |
| 18 | No module-to-module coupling introduced | ✅ PASS | All Support features route through Platform Services |
| 19 | Layered architecture: Presentation→Application→Domain→Services→Adapters→Engines | ✅ PASS | Request path confirmed end-to-end in E2E tests |
| 20 | Security: `withPlatformApiAuth` enforces auth+authz on every route | ✅ PASS | All 21 routes wrapped |

---

## Scope summary

| Component | Location | Status |
|-----------|----------|--------|
| Support Request routes (14 endpoints) | `apps/web/app/api/v1/support-requests/` | ✅ Complete |
| Organization routes (3 endpoints) | `apps/web/app/api/v1/support-organizations/` | ✅ Complete |
| Group routes (3 endpoints) | `apps/web/app/api/v1/support-groups/` | ✅ Complete |
| User routes (2 endpoints) | `apps/web/app/api/v1/support-users/` | ✅ Complete |
| Search route (1 endpoint) | `apps/web/app/api/v1/support-search/` | ✅ Complete |
| Analytics route (1 endpoint) | `apps/web/app/api/v1/support-analytics/` | ✅ Complete |
| Support handler (771 lines) | `apps/web/lib/api/v1/handlers/support.ts` | ✅ Complete |
| Support schemas (298 lines) | `apps/web/lib/api/v1/schemas/support.ts` | ✅ Complete |
| Zammad providers (11 files) | `packages/platform-services/src/providers/zammad/` | ✅ Complete |
| Support service impls (1,239 lines) | `packages/platform-services/src/services/support-service-impls.ts` | ✅ Complete |
| Support mapping helpers (103 lines) | `packages/platform-services/src/services/support-mapping-helpers.ts` | ✅ Complete |

---

## Accepted limitations

These are documented constraints, not defects:

| Limitation | Justification |
|-----------|---------------|
| No Support UI (no frontend module) | Excluded from OSS-110 scope; future OSS-110-13+ |
| No Platform Event Bus publication | Deferred; requires Event Bus infrastructure (future sprint) |
| No webhook HTTP ingress | Deferred; requires webhook infrastructure (future sprint) |
| No binary attachment transfer | Adapter layer limitation (OSS-102-08 CERTIFIED_WITH_LIMITATIONS) |
| Durable idempotency (persistent sync state) | In-memory only; deferred to production deployment |
| Next.js `/_global-error` build caveat | Known Next.js App Router behaviour; not a Support defect |

---

## Dependency audit reference

- **Script:** `scripts/support-vertical-dependency-audit.mjs`
- **Output:** `docs/sprint/OSS-110-12-dependency-audit.md` / `.json`
- **Verdict:** PASS (0 violations)

---

## Test certification reference

- **E2E stack:** `testing/support-vertical/support-vertical-stack.e2e.test.ts`
- **Performance:** `testing/support-vertical/support-vertical-performance.baseline.test.ts`
- **Certification assertions:** `testing/support-vertical/support-vertical-certification.test.ts`
- **HTTP API tests:** `apps/web/lib/api/v1/platform-api.support.v1.test.ts` (897 lines)
- **Platform services tests:** `packages/platform-services/src/support-platform-services.test.ts` (925 lines)

---

## Recommendation

Support Vertical Slice is **architecturally sound** and **ready for CERTIFIED_WITH_LIMITATIONS** outcome.

Proceed to **OSS-110-13** (Support UI module) only after explicit owner approval.
