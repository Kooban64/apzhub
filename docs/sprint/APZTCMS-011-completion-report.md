# APZTCMS-011 — Completion Report

**Milestone:** APZTCMS-011 — Testing Platform Services & Gateway Integration  
**Product:** APZ TCMS  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — platform service contracts + implementations; nested `gateway.testing.*`; pipeline authz; bootstrap factories  
**Next:** **APZTCMS-012** — Testing HTTP API, OpenAPI & Production Typed Client — **recommended**  
**Deferred:** AI Assist (former backlog 011 AI scope) — after 012 or as APZTCMS-013

---

## Executive Summary

APZTCMS-011 delivers the **platform service layer** for APZ TCMS. `@apzhub/platform-service-contracts` **0.8.0** and `@apzhub/platform-services` **0.8.0** expose seventeen testing capabilities through **`gateway.testing.*`**, wrapped in the shared `RequestPipeline` with explicit operation → permission mapping. Bootstrap factories (`createTestingPlatformServices`, `ForProduction`, `ForTest`) require explicit persistence — **no silent in-memory production fallback** and **no silent allow-all authz in production**.

Domain packages remain unchanged: contracts **0.6.0**, persistence **0.7.0**, services **0.5.0**. The workbench **mock client is unchanged** — no HTTP routes, no Event Bus, no AI, no binary evidence, no runners. Platform layer is ready for APZTCMS-012 HTTP ingress and typed client swap.

---

## Platform Service Architecture

Seventeen `Testing*ServiceImpl` classes delegate to `TestingDomainServices`. Request path:

```text
gateway.testing.* → RequestPipeline → Testing*ServiceImpl → domain → repos → PostgreSQL
```

Architecture pack: [Testing Platform Service Architecture](../architecture/APZHUB-Testing-Platform-Service-Architecture.md) · [Domain-Platform Boundary](../architecture/APZHUB-Testing-Domain-Platform-Boundary-Guide.md).

---

## Service Contracts

Platform contracts under `packages/platform-service-contracts/src/services/testing/` — `TestingPlatformGateway` aggregate with `plans`, `suites`, `cases`, `requirements`, `executions`, `evidence`, `automation`, `coverage`, `defects`, `quality`, `certification`, `releaseReadiness`, `traceability`, `approvals`, `dashboard`, `reporting`.

Catalogue: [Testing Platform Service Contracts](../architecture/APZHUB-Testing-Platform-Service-Contracts.md).

---

## Gateway Surface

Nested accessor: **`PlatformServiceGateway.testing`**.

When disabled (no bundle wired / `TESTING_SERVICE_ENABLED` not `"true"`):

- Throws `PlatformServiceError` — `PROVIDER_CAPABILITY_UNSUPPORTED`, message **"Testing service is not enabled"**

Reference: [Testing Gateway Reference](../architecture/APZHUB-Testing-Gateway-Reference.md) · [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md).

---

## Permissions

- Domain catalogue: `APZ_TCMS_PERMISSIONS` in `@apzhub/testing-contracts`
- Platform merge: `PLATFORM_SERVICE_PERMISSION_CATALOGUE` spreads `APZ_TCMS_PERMISSIONS`
- Explicit operation map: `operation-authorization-map.ts` — testingPlan through testingReporting ops

Guides: [Testing Permission Catalogue](../architecture/APZHUB-Testing-Permission-Catalogue.md) · [Testing Operation Permission Map](../architecture/APZHUB-Testing-Operation-Permission-Map.md).

---

## Bootstrap & Configuration

| Factory | Use |
| ------- | --- |
| `createTestingPlatformServices` | Custom persistence or pre-built domain — throws without input |
| `createTestingPlatformServicesForProduction` | Postgres only |
| `createTestingPlatformServicesForTest` | Requires persistence or `allowInMemoryPersistence: true` |

Env: **`TESTING_SERVICE_ENABLED`** — only `"true"` enables wiring at app bootstrap.

Guide: [Testing Bootstrap Configuration Guide](../architecture/APZHUB-Testing-Bootstrap-Configuration-Guide.md).

---

## Health & Readiness

`TestingReadinessIndicators` reports honest unwired state: `httpRoutes: "not-wired"`, `eventBus: "not-wired"`, `binaryEvidenceStorage: "out-of-scope"`.

Guide: [Testing Health Readiness Guide](../architecture/APZHUB-Testing-Health-Readiness-Guide.md).

---

## Error Model

`mapTestingDomainError` translates `DomainRuleError` and `PersistenceError` to `PlatformServiceError` with correlation ID. Gateway disabled uses configuration category.

Guide: [Testing Error Model](../architecture/APZHUB-Testing-Error-Model.md).

---

## Security & Tenancy

Tenant isolation via context assertion, domain scoping, repository RLS, and `TENANT_MISMATCH` mapping. Production authz deny-by-default via operation map.

Guide: [Testing Security Tenancy Guide](../architecture/APZHUB-Testing-Security-Tenancy-Guide.md).

---

## Workbench (unchanged)

APZTCMS-010 presentation layer unchanged — `MockTestingClient` in `apps/web/lib/testing`. Platform layer ready for future `HttpTestingClient` in APZTCMS-012.

Updated: [Testing Workbench Architecture](../architecture/APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md).

---

## Tests

| Suite | Scope | Result |
| ----- | ----- | ------ |
| Platform testing (targeted) | `platform-services/src/services/testing/*`, `testing-operation-authorization.test.ts` | **33** passed |
| Testing domain regression | `testing-contracts`, `testing-persistence`, `testing-services` | **204** passed |
| Architecture boundary | Import scan + no HTTP/AI/event folders | **PASS** |

User brief cited ~**45+** targeted platform tests — current targeted APZTCMS-011 suite is **33** Vitest cases; domain regression **204** green.

---

## Quality Gates

| Gate | Result |
| ---- | ------ |
| Platform-services targeted tests | **PASS** (33) |
| Testing domain packages regression | **PASS** (204) |
| Architecture boundary | **PASS** |
| Domain lint/typecheck (testing packages) | **PASS** (unchanged) |
| `apps/web` typecheck | **FAIL** — pre-existing plane/zammad harness errors (**not introduced by 011**) |
| HTTP / Event Bus / AI / binary evidence | **PASS** (excluded as required) |
| Silent in-memory / allow-all production | **PASS** (guarded by factory throws + authz mode) |

---

## Technical Debt

1. No HTTP `/api/v1/testing-*` routes — APZTCMS-012  
2. Workbench mock client not swapped to platform gateway — APZTCMS-012  
3. `services/testing/service.yaml` `implementationPackage` updated to `@apzhub/platform-services` but manifest `contractVersion` still references early 0.1.0 stub — align on future manifest pass  
4. Reporting service returns placeholders only — no report engine  
5. Binary evidence storage remains out-of-scope  
6. Event Bus not wired — domain events not published through platform  
7. Pre-existing `apps/web` typecheck failures (plane/zammad) unrelated to testing platform layer  

---

## Recommendation for APZTCMS-012

**Testing HTTP API, OpenAPI & Production Typed Client** — recommended next:

1. `/api/v1/testing-*` route handlers — auth → context → `gateway.testing.*` only  
2. OpenAPI spec aligned with platform contracts and operation map  
3. Production `HttpTestingClient` implementing existing `TestingClient` surface  
4. Standard response envelope + `PlatformServiceError` mapping  
5. E2E against live API (replace mock-only Playwright path incrementally)  

Do **not** start APZTCMS-012 without owner approval.

**AI Assist** (advisory) — deferred until after 012; renumber note: former backlog "APZTCMS-011 AI Assist" becomes post-012 or **APZTCMS-013**.

---

## Deliverable checklist

| Item | Status |
| ---- | ------ |
| `@apzhub/platform-service-contracts` **0.8.0** — testing service interfaces + gateway | ✅ |
| `@apzhub/platform-services` **0.8.0** — impls, factories, error map, readiness | ✅ |
| `gateway.testing.*` on `PlatformServiceGateway` | ✅ |
| Operation authorization map (testing ops) | ✅ |
| `TESTING_SERVICE_ENABLED` + no silent in-memory/allow-all | ✅ |
| Architecture docs pack (10 guides) | ✅ |
| Workbench architecture note (mock remains) | ✅ |
| Platform gateway spec updated | ✅ |
| Package README updates | ✅ |
| `services/testing/service.yaml` implementationPackage | ✅ |
| Foundation / backlog / changelog / docs README closeout | ✅ |
| Stop before APZTCMS-012 | ✅ |
