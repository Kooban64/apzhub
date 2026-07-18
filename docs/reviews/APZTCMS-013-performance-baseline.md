# APZTCMS-013 — Performance Baseline

**Date:** 2026-07-12  
**Mode:** Measure only — **no optimisations**  
**Classification input:** Baseline established for future comparison

---

## Suite timings (Vitest)

| Suite                                                              | Result | Duration                         |
| ------------------------------------------------------------------ | ------ | -------------------------------- |
| TCMS vertical stack (52 files / 478 tests)                         | PASS   | **20.91s** wall; tests **9.96s** |
| Related regression (Plane/Zammad/SDK/authz — 41 files / 417 tests) | PASS   | **25.77s**                       |
| Focused API + HTTP client (19 tests)                               | PASS   | **4.58s** wall; tests **372ms**  |

### Sample API / client timings (verbose)

| Operation class                            | Observed        |
| ------------------------------------------ | --------------- |
| HTTP client list/detail URL construction   | ~1–9ms per test |
| Plans list/create/get through mock gateway | ~35ms           |
| Automation import (validate + import)      | ~16ms           |
| Certification approve + release readiness  | ~12ms           |
| Anonymous auth denial                      | ~8ms            |
| OpenAPI path documentation assertion       | ~205ms          |

---

## Source size baseline (non-test LOC approx.)

| Area                                | Lines     |
| ----------------------------------- | --------- |
| `@apzhub/testing-contracts`         | 5,178     |
| `@apzhub/testing-foundation`        | 321       |
| `@apzhub/testing-persistence`       | 9,500     |
| `@apzhub/testing-services`          | 11,051    |
| Platform testing services           | 1,422     |
| `apps/web/lib/testing`              | 2,917     |
| `apps/web/components/testing`       | 2,084     |
| `handlers/testing.ts`               | 765       |
| HTTP routes tree                    | 2,578     |
| `http-client.ts` / `mock-client.ts` | 888 / 769 |

---

## Bundle / memory

| Metric                   | Observation                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `apps/web/.next` present | **486M** on disk (existing build artifact; not rebuilt this milestone) |
| Page load / SSR timings  | **Not measured** — app not running on `:3300`                          |
| Heap / memory profiling  | **Not measured** — measure-only baseline without live app              |

---

## Guidance

Use this document as the APZTCMS-013 baseline. Do not treat missing live page-load numbers as optimisation work under this milestone.
