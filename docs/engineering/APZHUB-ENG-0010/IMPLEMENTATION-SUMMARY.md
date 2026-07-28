# APZHUB-ENG-0010 — Implementation Summary

> **Programme:** APZHUB-ENG-0010  
> **Title:** Implement RG-PW-API Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** **ACCEPTED / CLOSED** (Owner Decision with APZHUB-ENG-0011)

---

## Authorised remediation group

| Group         | Result                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| **RG-PW-API** | **Resolved** — 3/3 member tests PASS (1 flaky residual on tablist hydration) |

---

## Root cause fixed

Playwright specs called `page.getByLabelText(...)`, which is a Testing Library API and does not exist on Playwright's `Page` → `TypeError: page.getByLabelText is not a function`.

**Fix:** Replace with Playwright `page.getByLabel(...)` in the two member specs.

---

## Repository impact

| Area                                                                            | Change                                         |
| ------------------------------------------------------------------------------- | ---------------------------------------------- |
| `testing/playwright/e2e/apzreport-002-platform-reporting-workbench.spec.ts`     | `getByLabelText` → `getByLabel`                |
| `testing/playwright/e2e/apztcms-022-engineering-intelligence-workbench.spec.ts` | `getByLabelText` → `getByLabel` (2 call sites) |

---

## Architecture / SemVer

- **Architecture impact:** None — Playwright test defect only.
- **SemVer impact:** None.
- **Public APIs / DB / Platform Services:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope (not modified)

RG-SELECTORS · product workbench residuals · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0011

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
