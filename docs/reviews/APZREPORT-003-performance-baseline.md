# APZREPORT-003 — Performance Baseline

**Date:** 2026-07-13  
**Status:** **COLLECTED** (no optimisations performed)  
**Certification:** APZREPORT-003

---

## Measurement method

Focused Vitest suite for the reporting vertical (contracts, core, gateway, HTTP handlers, typed client, workbench) with coverage instrumentation disabled for wall-clock note; coverage run recorded separately.

## Suite timings

| Layer                                | Focused suite                                                           | Approx duration |
| ------------------------------------ | ----------------------------------------------------------------------- | --------------- |
| Vertical Vitest (45 tests, 13 files) | contracts + core + TCMS reporting + gateway + HTTP + client + workbench | **~7–12 s**     |
| Coverage-enabled same suite          | as above                                                                | **~12.7 s**     |
| Static architecture audit script     | `apzreport-003-reporting-vertical-audit.mjs`                            | **<1 s**        |
| OpenAPI validate                     | `pnpm openapi:validate:platform`                                        | **~3–4 s**      |

## Surface sizes (LOC order-of-magnitude)

| Surface                             | Notes                             |
| ----------------------------------- | --------------------------------- |
| HTTP handlers + schemas + routes    | Thin gateway adapters             |
| Typed client                        | Single-file requestJson + mappers |
| Workbench view                      | One primary view + router         |
| Reporting core + 6 output providers | Shared engine (APZREPORT-001)     |

## Observations

- No performance regressions introduced (certification-only milestone).
- Workbench list pagination is client-side (page size 10) — adequate for current template catalogues.
- Rendering cost dominated by template bind + format provider (in-process); no remote binary storage I/O.

## Non-goals

No caching · no CDN · no worker offload · no query optimisation · no bundle splitting changes.
