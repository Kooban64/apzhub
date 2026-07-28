# APZHUB-ENG-0011 — Implementation Summary

> **Programme:** APZHUB-ENG-0011  
> **Title:** Implement RG-SELECTORS Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** **ACCEPTED / CLOSED** (Owner Decision with APZHUB-ENG-0012)

---

## Authorised remediation group

| Group            | Result                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| **RG-SELECTORS** | **Resolved** — 4/4 member tests PASS (1 flaky residual on TCMS heading hydration) |

---

## Root cause fixed

Ambiguous Playwright `getByText` locators matched multiple nodes (table cell + detail panel / highlight column / chrome), triggering strict-mode failures.

**Fix (test hygiene only):** disambiguate with role-based locators — `getByRole("cell"|"row", …)`.

---

## Repository impact

| Spec                                               | Change                                             |
| -------------------------------------------------- | -------------------------------------------------- |
| `apzdocs-005-platform-documents-workbench.spec.ts` | `getByRole("cell", { name: "Playwright Policy" })` |
| `apzsearch-007-platform-search-workbench.spec.ts`  | `getByRole("row", { name: /Playwright Policy/ })`  |
| `apztcms-018-pipeline-workbench.spec.ts`           | `getByRole("cell", { name: "CI", exact: true })`   |
| `apzobserve-004-observe-workbench.spec.ts`         | `getByRole("cell", { name: "ad_pw" })`             |

---

## Architecture / SemVer

- **Architecture impact:** None — Playwright selector hygiene only.
- **SemVer impact:** None.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope

RG-METRICS-WB · RG-TCMS-WB · RG-WORKFLOW-WB · RG-VISUAL · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0012

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
