# APZHUB-QA-CERT-003 — Playwright Results

> **Programme:** APZHUB-QA-CERT-003  
> **Suite:** `pnpm test:e2e` via `ops:portfolio-recert --mode full`  
> **Date:** 2026-07-21  
> **Duration:** ~11.3m  
> **Evidence:** [20260721T193400Z-R12-QA-01-full-FAIL.json](../../operations/evidence/portfolio-recert/20260721T193400Z-R12-QA-01-full-FAIL.json)

---

## Summary

| Metric                  |   Count |
| ----------------------- | ------: |
| Passed                  | **119** |
| Failed (hard)           |   **1** |
| Flaky (passed on retry) |   **6** |

**Portfolio full verdict:** **FAIL**

Docker stage: compose config **PASS**; services healthy (`apzhub-caddy`, `apzhub-postgres`, `apzhub-redis`).

---

## Hard failure (1)

### CERT3-PW-001 — Support visual analytics screenshot

| Field                | Value                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Spec                 | `testing/playwright/e2e/oss-110-14-support-visual.spec.ts:31`           |
| Title                | OSS-110-14 Support visual baselines › analytics screenshot              |
| Product              | **Support**                                                             |
| Package              | `apps/web` (Support workbench presentation)                             |
| Platform Service     | Support catalogue / Presentation surface                                |
| Assertion            | `toHaveScreenshot("support-analytics.png")`                             |
| Observed fact        | Expected image **1280×928**; received **1280×1064**                     |
| Attempts             | Failed on initial + retry #1 + retry #2                                 |
| Root cause (factual) | Visual baseline dimension / content mismatch against committed snapshot |

---

## Flaky (6) — passed on retry

| Spec                                                     | Title                                     | First-attempt symptom (factual)                           |
| -------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| `apznotify-004-platform-notifications-workbench.spec.ts` | notifications section lists metadata      | `getByText('Playwright notice')` strict-mode (2 elements) |
| `apztcms-010-testing-workbench.spec.ts`                  | dashboard loads with testing page shell   | `testing-page` not visible within timeout                 |
| `apztcms-012-testing-http.spec.ts`                       | opens workbench and lists plans           | heading not visible within timeout                        |
| `apztcms-022-engineering-intelligence-workbench.spec.ts` | panel tabs and a11y landmarks             | "Quality & delivery trends" not found                     |
| `apztcms-023-executive-dashboards.spec.ts`               | opens QA dashboard and remains responsive | `dashboard-qa` not visible                                |
| `oss-110-14-support-performance.baseline.spec.ts`        | Soft timings for major Support views      | `support-request-detail` timeout (30s) on first attempt   |

---

## Notable passes (punch-list / prior residuals)

Law API developer experience **6/6 PASS**. Analytics / Projects / Time workbench detail navigation **PASS**. Configuration workbench browses **PASS**. SPR-003 context persistence **PASS**.
