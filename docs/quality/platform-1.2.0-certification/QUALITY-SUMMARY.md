# APZHUB-QA-CERT-003 — Quality Summary

> **Programme:** APZHUB-QA-CERT-003  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21

---

## Results at a glance

| Gate                       | Result                                     |
| -------------------------- | ------------------------------------------ |
| Lint                       | **PASS**                                   |
| TypeScript                 | **PASS**                                   |
| Vitest                     | **PASS** (5013 / 0 failed)                 |
| Integration (via Vitest)   | **PASS**                                   |
| OpenAPI Platform + Law     | **PASS**                                   |
| Portfolio path             | **PASS**                                   |
| Portfolio Playwright full  | **FAIL** (119 passed · 1 failed · 6 flaky) |
| Architecture verification  | **PASS** (unchanged; cert-only)            |
| Compatibility verification | **PASS** (unchanged; cert-only)            |

## Comparison to prior certification runs

| Metric                 | QA-CERT-001 | QA-CERT-002 | QA-CERT-003 |
| ---------------------- | ----------: | ----------: | ----------: |
| Lint                   |        FAIL |        FAIL |    **PASS** |
| Typecheck              |        PASS |        PASS |    **PASS** |
| Vitest failed          |          82 |           1 |       **0** |
| Playwright passed      |          84 |         115 |     **119** |
| Playwright hard failed |          19 |          10 |       **1** |
| Playwright flaky       |          30 |           1 |       **6** |
| Verdict                |        FAIL |        FAIL |    **FAIL** |

## Remaining hard failures

**1** — Support visual baseline `support-analytics.png` (dimension mismatch 1280×928 expected vs 1280×1064 received).

## Remaining flaky tests

**6** — Notifications workbench; TCMS workbench/HTTP/EI/executive; Support Soft performance baseline (all passed on retry).

## Overall

**CERTIFICATION FAILED**
