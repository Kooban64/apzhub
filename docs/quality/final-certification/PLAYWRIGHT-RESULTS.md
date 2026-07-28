# APZHUB-QA-CERT-002 — Playwright Results

> **Programme:** APZHUB-QA-CERT-002  
> **Suite:** `pnpm test:e2e` via `ops:portfolio-recert --mode full`  
> **Date:** 2026-07-21  
> **Duration:** ~15.2m

---

## Summary

| Metric                  |   Count |
| ----------------------- | ------: |
| Passed                  | **115** |
| Failed (hard)           |  **10** |
| Flaky (passed on retry) |   **1** |

**Portfolio full verdict:** **FAIL**  
Evidence: [20260721T183118Z-R12-QA-01-full-FAIL.json](../../operations/evidence/portfolio-recert/20260721T183118Z-R12-QA-01-full-FAIL.json)

---

## Comparison to QA-CERT-001

| Metric | QA-CERT-001 | QA-CERT-002 |
| ------ | ----------: | ----------: |
| Passed |          84 |     **115** |
| Failed |          19 |      **10** |
| Flaky  |          30 |       **1** |

Wave 2 remediations reduced hard failures and flaky load. Portfolio is **not green**.

---

## Hard failures (10)

1. `apzconfig-004` — browses configurations and diagnostics
2. `apzhub-analytics-workbench` — open Analytics home, suite, and dashboard detail
3. `apzhub-projects-001-workbench` — open Projects list and project detail  
   4–5. `apzhub-time-1.0-workbench` — open Time timesheets / create timesheet  
   6–9. `law-api-developer-experience` — OpenAPI YAML/JSON, developer guide markdown, law API health
4. `spr-003-workbench-context-selection` — navigation updates persisted workbench context

---

## Flaky (1)

1. `oss-110-14-support-performance.baseline` — Soft timings for major Support views (failed then passed on retry)

---

## Wave 2 residual members (observation)

Previously assigned Wave 2 residual hard cases (Support cert, Observe, Visual inbox, auth/shell SPR hard set) did **not** appear in this hard-fail list. Remaining failures are outside the closed Wave 2 remediation-group inventory and require separate Owner-authorised analysis/engineering if pursued.
