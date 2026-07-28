# APZHUB Platform 1.2.0 — Quality Metrics

> **Programme:** APZHUB-POST-IMPLEMENTATION-001  
> **Date:** 2026-07-20  
> **Sources:** Programme QUALITY-EVIDENCE · [platform/1.2.0 QUALITY-EVIDENCE](../QUALITY-EVIDENCE.md) · [readiness QUALITY-SUMMARY](../../../1.2/readiness/QUALITY-SUMMARY.md)

---

## Authorised P0 engineering gates

| Programme | Typecheck | Lint | Tests | Architecture / audit                                           | Compat |
| --------- | --------- | ---- | ----- | -------------------------------------------------------------- | ------ |
| 1.2-002   | PASS      | PASS | PASS  | PASS                                                           | PASS   |
| 1.2-003   | PASS      | PASS | PASS  | PASS                                                           | PASS   |
| 1.2-004   | PASS      | PASS | PASS  | PASS                                                           | PASS   |
| 1.2-005   | PASS      | PASS | PASS  | PASS (`audit:search-time`); frozen-wave pin drift pre-existing | PASS   |
| 1.2-006   | PASS      | PASS | PASS  | PASS (`audit:search-law`)                                      | PASS   |
| 1.2-007   | PASS      | PASS | PASS  | PASS (`audit:gitlab-ci`)                                       | PASS   |

**P0 programme quality pass rate:** **6 / 6 (100%)** for authorised scope.

## Certification / readiness quality

| Gate                              | Result                                  |
| --------------------------------- | --------------------------------------- |
| Readiness verification matrix     | **PASS** (with notes / Theme D–E waive) |
| Certification verification matrix | **PASS**                                |
| Packaging programme code changes  | **None** (docs only)                    |

## Deferred quality items (not failures of authorised scope)

| Item                                          | Disposition                    |
| --------------------------------------------- | ------------------------------ |
| R12-QA-01 Playwright/Docker portfolio re-cert | P1 residual KL                 |
| Frozen search-publication wave pin drift      | Pre-existing hygiene           |
| Live Search drain / Observe live delivery E2E | Explicit non-goals / residuals |

## QA baseline held

QA-002 repository **PRODUCTION READY** — **HELD** through Release 1.2.
