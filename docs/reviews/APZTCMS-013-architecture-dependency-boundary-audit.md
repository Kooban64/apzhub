# APZTCMS-013 — Architecture, Dependency & Boundary Audit

**Date:** 2026-07-12  
**Verdict:** **PASS** — zero violations  
**Certification:** APZTCMS-013

---

## Dependency direction (verified)

```text
UI (apps/web/components/testing, apps/web/lib/testing)
  → Typed Client
    → HTTP (app/api/v1/testing + handlers/testing.ts)
      → Gateway (platform-services gateway.testing)
        → Platform Services
          → Domain (@apzhub/testing-services)
            → Persistence (@apzhub/testing-persistence)
              → Database (Drizzle / platform PostgreSQL)
```

No reverse dependencies observed.

---

## Forbidden import matrix

| Rule                                                                                   | Result   |
| -------------------------------------------------------------------------------------- | -------- |
| UI never imports domain services / repositories / persistence / platform-services impl | **PASS** |
| HTTP handlers never import repositories / testing-persistence / testing-services       | **PASS** |
| Gateway file never imports testing-persistence                                         | **PASS** |
| Domain never imports UI / gateway / apps/web                                           | **PASS** |
| Persistence never imports UI / gateway / apps/web                                      | **PASS** |

### Evidence paths

- UI: `apps/web/components/testing/**`, `apps/web/lib/testing/**`
- Handlers: `apps/web/lib/api/v1/handlers/testing.ts` — `getPlatformServiceGateway()` + `gateway.testing.*` only
- Gateway: `packages/platform-services/src/gateway/platform-service-gateway.ts`
- Composition (allowed): `packages/platform-services/src/services/testing/create-testing-platform-services.ts`

---

## Layering & conventions

| Check                                                                      | Result   |
| -------------------------------------------------------------------------- | -------- |
| RequestPipeline usage for Testing operations                               | **PASS** |
| Gateway-only HTTP access to domain                                         | **PASS** |
| No UI business logic                                                       | **PASS** |
| No HTTP business logic (thin handlers)                                     | **PASS** |
| No repository / persistence leakage to UI or HTTP                          | **PASS** |
| Typed client scoped to `/api/v1/testing`                                   | **PASS** |
| No AI / Event Bus / notifications packages under Testing platform services | **PASS** |

**Note:** Domain `events/` folders are in-memory collectors / contract vocabulary only — not Platform Event Bus publication.

---

## Package roles

| Package                              | Version | Role                       |
| ------------------------------------ | ------- | -------------------------- |
| `@apzhub/testing-contracts`          | 0.6.0   | Shared contracts           |
| `@apzhub/testing-foundation`         | 0.1.0   | Registries / validators    |
| `@apzhub/testing-persistence`        | 0.7.0   | Repositories + schema      |
| `@apzhub/testing-services`           | 0.5.0   | Domain services            |
| `@apzhub/platform-service-contracts` | 0.8.0   | Gateway contracts          |
| `@apzhub/platform-services`          | 0.8.0   | Gateway + platform façades |

---

## Automated boundary tests

| File                                                                                    | Role                         |
| --------------------------------------------------------------------------------------- | ---------------------------- |
| `apps/web/components/testing/testing-architecture-boundary.test.ts`                     | UI / client / route thinness |
| `packages/platform-services/src/services/testing/testing-architecture-boundary.test.ts` | Cross-layer + HTTP presence  |
| `packages/testing-services/src/boundary.test.ts`                                        | Domain isolation             |
| `packages/testing-persistence/src/boundary.test.ts`                                     | Persistence isolation        |

All executed green in the APZTCMS-013 Vitest stack (478 tests).

---

## Route inventory

**73** `route.ts` files under `apps/web/app/api/v1/testing/**` (thin Next.js delegates).
