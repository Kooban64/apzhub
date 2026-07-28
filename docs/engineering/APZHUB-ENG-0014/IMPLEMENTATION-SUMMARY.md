# APZHUB-ENG-0014 — Implementation Summary

> **Programme:** APZHUB-ENG-0014  
> **Title:** Implement RG-WORKFLOW-WB Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** Complete — **Awaiting Acceptance**

---

## Authorised remediation group

| Group              | Result                                          |
| ------------------ | ----------------------------------------------- |
| **RG-WORKFLOW-WB** | **Resolved** — 2/2 member Playwright tests PASS |

---

## Root cause fixed

Workflow Engine workbench E2E mocked `/api/v1/workflows/engine/**`, but the **workflows list** branch used:

`endsWith("/engine/workflows") && !pathname.includes("/workflows/")`

List path `/api/v1/workflows/engine/workflows` always contains `/workflows/` (platform prefix), so the list mock **never matched** and fell through to 404. Workflows section timed out; overview assertions were unstable when the typed-client path did not see successful engine calls.

**Fix:** Exact-path matching for list vs detail; sign-in before mocks; role-based cell locator for workflow name (strict-mode after successful load).

---

## Repository impact

| Area                                                                       | Change                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `testing/playwright/e2e/apzworkflow-009-workflow-engine-workbench.spec.ts` | Exact engine HTTP mock paths; auth/mock order; cell locator |

---

## Architecture / SemVer

- **Architecture impact:** None — Playwright harness only.
- **SemVer impact:** None.
- **Platform Services / UI / APIs:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.
- **Workflow Execute:** Still locked (no Execute button asserted).

---

## Out of scope

RG-VISUAL · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0015

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
