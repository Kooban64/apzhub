# APZHUB-ENG-0013 — Implementation Summary

> **Programme:** APZHUB-ENG-0013  
> **Title:** Implement RG-TCMS-WB Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** Complete — **Awaiting Acceptance**

---

## Authorised remediation group

| Group          | Result                                          |
| -------------- | ----------------------------------------------- |
| **RG-TCMS-WB** | **Resolved** — 2/2 member Playwright tests PASS |

---

## Root cause fixed

Testing workbench E2E (`apztcms-010`) authenticated but did **not** mock `/api/v1/testing/**`. Production browser path uses HTTP `TestingClient` (not in-process mock). Without mocks:

1. **Dashboard** — `getDashboard()` fails → PageShell mounts but `testing-dashboard-stats` never renders.
2. **Certification detail** — `getCertification()` fails → bare `ErrorState` / `LoadingState` **without** PageShell → `testing-page` missing; gates / “Advisory only” never appear.

**Fix:** Install Playwright route mocks for dashboard + certification detail (fixture-aligned payloads) before navigation; wait for certification GET before asserting shell.

---

## Repository impact

| Area                                                           | Change                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `testing/playwright/e2e/apztcms-010-testing-workbench.spec.ts` | `mockTestingWorkbenchApi`; applied to the two RG-TCMS-WB member tests |

---

## Architecture / SemVer

- **Architecture impact:** None — Playwright harness only.
- **SemVer impact:** None.
- **Platform Services / UI / APIs:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope

RG-WORKFLOW-WB · RG-VISUAL · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0014

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
