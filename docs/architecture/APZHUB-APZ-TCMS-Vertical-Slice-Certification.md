# APZHUB APZ TCMS — Vertical-Slice Certification Report

**Certification ID:** APZTCMS-013  
**Date:** 2026-07-12  
**Outcome:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Issued by:** APZHUB Engineering (architecture audits + automated quality suite)  
**Prerequisite:** APZTCMS-001 … APZTCMS-012 complete

---

## Executive summary

APZ TCMS is certified as a production-ready APZHUB module **with documented limitations**. The vertical slice is architecturally compliant end to end:

```text
Workbench UI
  → Typed Client (createHttpTestingClient / mock for tests)
    → HTTP `/api/v1/testing/**`
      → PlatformServiceGateway.testing.*
        → RequestPipeline (authn / authz / validation)
          → Platform Services
            → Domain Services (`@apzhub/testing-services`)
              → Persistence (`@apzhub/testing-persistence`)
                → PostgreSQL
```

No new business functionality, APIs, UI, domain behaviour, AI, Event Bus, notifications, runners, or workflow expansion were introduced in this milestone. Certification harness fixes (fixture typing, boundary test alignment) only.

---

## Certification outcome: PRODUCTION_READY_WITH_LIMITATIONS

### Why not full PRODUCTION_READY

| Limitation                                                                 | Category      | Impact                                                                                              |
| -------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| Playwright E2E not executed in this session (`:3300` unavailable)          | Evidence gap  | Specs exist (`apztcms-010`, `apztcms-012`); live browser certification deferred to ops re-run       |
| `apps/web` excluded from root Vitest coverage include                      | Measurement   | UI/handler line % not in consolidated V8 report; certified via unit/component pass + boundary tests |
| Pre-existing Plane/Zammad / harness typecheck debt                         | Cross-product | Outside TCMS domain packages (domain typecheck **PASS**)                                            |
| Explicit product exclusions (AI, Event Bus, binary evidence, live runners) | Design        | Accepted constraints — not defects                                                                  |
| Typed-client collection gaps carried from APZTCMS-012                      | Known debt    | Empty collections where HTTP endpoints absent                                                       |

### Why not READY_WITH_LIMITATIONS / NOT_READY

Architecture, dependency, and boundary audits report **zero violations**. Domain packages typecheck and lint. OpenAPI validates. TCMS Vitest stack **478/478**. Related regression suites **417/417**. Security controls (authn denial, RequestPipeline authz, tenant context, correlation IDs, metadata-only evidence) are verified by automated tests. Certification remains human-approved and advisory recommendations stay non-authoritative (`advisoryOnly: true`, release readiness `isDecision: false`).

---

## Layer outcomes

| Layer                                                | Outcome                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| Architecture / dependency / boundary                 | **PASS** — 0 violations                                                      |
| HTTP API + OpenAPI                                   | **PASS** — OpenAPI valid; 73 routes; gateway-only handlers                   |
| Typed client                                         | **PASS** — `/api/v1/testing` scoped; abort/credentials/errors covered        |
| Workbench UI                                         | **PASS** (unit/component) — presentation-only; permissions/nav/views covered |
| Domain manual / automation / quality / certification | **PASS** — domain Vitest green                                               |
| Platform services + gateway                          | **PASS** — `gateway.testing.*`; boundary tests                               |
| Persistence + PostgreSQL                             | **PASS** — persistence suite green                                           |
| Security                                             | **PASS** with documented exclusions                                          |
| Accessibility                                        | **PASS** (component + Playwright specs); live axe run deferred               |
| Performance                                          | **BASELINE COLLECTED** — measure-only                                        |
| Coverage (packages)                                  | **PASS** for domain/platform testing packages (see Quality Report)           |
| Playwright live                                      | **NOT RUN** this session — limitation                                        |

---

## Companion reports

| Document                                   | Path                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Production Readiness                       | [APZTCMS-013-production-readiness.md](../reviews/APZTCMS-013-production-readiness.md)                                     |
| Architecture / Dependency / Boundary Audit | [APZTCMS-013-architecture-dependency-boundary-audit.md](../reviews/APZTCMS-013-architecture-dependency-boundary-audit.md) |
| API Audit                                  | [APZTCMS-013-api-audit.md](../reviews/APZTCMS-013-api-audit.md)                                                           |
| Security Audit                             | [APZTCMS-013-security-audit.md](../reviews/APZTCMS-013-security-audit.md)                                                 |
| Accessibility Report                       | [APZTCMS-013-accessibility-report.md](../reviews/APZTCMS-013-accessibility-report.md)                                     |
| Performance Baseline                       | [APZTCMS-013-performance-baseline.md](../reviews/APZTCMS-013-performance-baseline.md)                                     |
| Quality Report                             | [APZTCMS-013-quality-report.md](../reviews/APZTCMS-013-quality-report.md)                                                 |
| Completion Report                          | [APZTCMS-013-completion-report.md](../sprint/APZTCMS-013-completion-report.md)                                            |

---

## Recommendation

Proceed only to **APZTCMS-014** after owner approval. Do not start AI Assist, Event Bus, or other tracks without separate approval.

---

## Stop condition

APZTCMS-013 is complete. **Do not begin APZTCMS-014** until explicit owner approval.
