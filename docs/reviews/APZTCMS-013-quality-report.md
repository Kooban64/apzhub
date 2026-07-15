# APZTCMS-013 — Quality Report

**Date:** 2026-07-12  
**Overall:** Quality gates **PASS** for TCMS certification scope (with documented limitations)

---

## Quality gates

| Gate | Result |
| ---- | ------ |
| Domain typecheck (`testing-*` packages) | **PASS** |
| Domain lint (`testing-*` packages) | **PASS** |
| TCMS Vitest stack | **PASS** — 52 files / **478** tests |
| Architecture / dependency / boundary | **PASS** — 0 violations |
| OpenAPI validate | **PASS** |
| Related regression (Plane, Zammad, Integration SDK, authorization) | **PASS** — 41 files / **417** tests |
| Playwright live | **SKIPPED** — no app on `:3300` |
| apps/web full typecheck | **PARTIAL** — Testing fixtures clean; ~25 pre-existing non-TCMS errors |
| platform-services typecheck | **PARTIAL** — Plane/Zammad harness + branded-id test debt |

---

## Coverage (V8, packages only)

Root `vitest` coverage include is `packages/**/src/**` and `integrations/**/src/**` — **apps/web is not instrumented**.

| Package / path | Statements | Branches | Functions | Lines |
| -------------- | ---------- | -------- | --------- | ----- |
| `@apzhub/testing-contracts` | 97.2% | 99.3% | 93.7% | 97.2% |
| `@apzhub/testing-foundation` | 100.0% | 90.2% | 100.0% | 100.0% |
| `@apzhub/testing-persistence` | 79.8% | 73.2% | 79.2% | 79.8% |
| `@apzhub/testing-services` | 96.8% | 83.1% | 99.0% | 96.8% |
| `platform-services/.../testing` | 98.2% | 98.4% | 99.4% | 98.2% |
| `apps/web/lib/testing` | n/a (excluded) | — | — | — |
| `apps/web/components/testing` | n/a (excluded) | — | — | — |
| `handlers/testing.ts` | n/a (excluded) | — | — | — |

Persistence branch/line coverage is the weakest package metric but remains backed by dedicated Postgres / repository / authorization suites.

---

## Typed client certification

| Concern | Status |
| ------- | ------ |
| Routes via `/api/v1/testing` | **PASS** |
| Envelope parse / mutations / queries | **PASS** |
| Error conversion | **PASS** |
| AbortSignal / credentials | **PASS** |
| Mock client parity for tests | **PASS** |
| Retry behaviour | Minimal / platform-default — no custom retry expansion in 013 |
| Cache invalidation | Query-key helpers covered; no React Query expansion in 013 |

---

## Workbench / domain / automation / certification

| Area | Status |
| ---- | ------ |
| Navigation, commands, views, permissions | **PASS** (Vitest) |
| Loading / errors / empty / bulk / breadcrumbs / context menus | **PASS** where implemented in views |
| Manual plans/suites/cases/executions/steps/evidence/history/state machine/approvals | **PASS** (domain services) |
| Vitest/Playwright/JUnit/JSON/TAP/Allure ingestion (no execution) | **PASS** (automation domain) |
| Certification gates / recommendations / approvals / audit / immutability | **PASS** — no auto-approve |
| Release readiness | **PASS** — `isDecision: false` |

---

## Technical debt tracked

1. Live Playwright re-run when app is available  
2. Optionally extend coverage include to `apps/web` Testing paths  
3. Plane/Zammad harness type literals  
4. APZTCMS-012 typed-client empty collection gaps  
5. platform-services Testing test brand casts (does not block runtime tests)
