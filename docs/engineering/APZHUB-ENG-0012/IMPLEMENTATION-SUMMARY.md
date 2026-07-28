# APZHUB-ENG-0012 — Implementation Summary

> **Programme:** APZHUB-ENG-0012  
> **Title:** Implement RG-METRICS-WB Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** Complete — **Awaiting Acceptance**

---

## Authorised remediation group

| Group             | Result                                          |
| ----------------- | ----------------------------------------------- |
| **RG-METRICS-WB** | **Resolved** — 2/2 member Playwright tests PASS |

---

## Root cause fixed

Metrics workbench E2E navigated to `/workspace/metrics/*` **without** authenticating. Unauthenticated requests never mounted `MetricsWorkspaceRouter` / `metrics-page` (login redirect), so `getByTestId('metrics-page')` and `metrics-unavailable` timed out.

**Fix:** Sign in via shared `signIn` helper (same pattern as Observe workbench cert) before navigating; retain mocked HTTP routes.

---

## Repository impact

| Area                                                              | Change                                                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `testing/playwright/e2e/apzmetrics-004-metrics-workbench.spec.ts` | Import `signIn`; call before overview navigation; visibility timeouts aligned with Observe cert |

---

## Architecture / SemVer

- **Architecture impact:** None — Playwright harness only.
- **SemVer impact:** None.
- **Platform Services / UI:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope

RG-TCMS-WB · RG-WORKFLOW-WB · RG-VISUAL · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0013

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
