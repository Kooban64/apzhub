# APZCONFIG-005 — Coverage Baseline

**Date:** 2026-07-16  
**Command:** Vitest with coverage scoped to Configuration vertical packages + HTTP + client + Workbench

## Consolidated result (APZCONFIG-005 measurement)

| Metric | Value |
| --- | --- |
| Statements / Lines | **93.11%** (5102 / 5479) |
| Functions | **92.17%** (424 / 460) |
| Branches | **77.19%** |

## Layer notes

| Layer | Notes |
| --- | --- |
| HTTP handlers | ~99.5% lines |
| Typed client | ~97%+ lines |
| Contracts / core (primary paths) | High; remaining branches in validation/hierarchy edge cases |
| Persistence Postgres repos | Partial via mocked Drizzle; live DB optional |
| Workbench view | Improved via APZCONFIG-005 certification tests; secondary empty/error paths remain |

## Target vs actual

Milestone aspirational target was ≥95% lines/functions. Achieved **93%+ lines / 92%+ functions**. Remaining gap is concentrated in Postgres repository branches and secondary UI error paths — not untested security boundaries. Classified under **PRODUCTION_READY_WITH_LIMITATIONS**.

## Certification-only coverage improvements

- `configuration-api.coverage.test.ts` — facade exhaustiveness
- Additional Workbench empty-state / keyboard / publish-version tests
