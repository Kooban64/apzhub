# APZTCMS-019 — Workbench Audit

**Date:** 2026-07-12  
**Verdict:** **PASS** (unit/component); live Playwright **LIMITED**

---

## Verified (Vitest / component)

| Area                                                                | Result                |
| ------------------------------------------------------------------- | --------------------- |
| Navigation / routes (`/workspace/testing/pipelines…`)               | PASS                  |
| Commands (refresh, open workflow/run, view artifacts/summary/links) | PASS — read-only only |
| Search / filter / sort on runs (client)                             | PASS                  |
| Status badges, duration, branch, commit, actor                      | PASS                  |
| Evidence / coverage / certification / release link panels           | PASS                  |
| Permission gating (`pipeline.read` / `pipeline.import`)             | PASS                  |
| Loading / empty / error / forbidden states                          | PASS                  |
| Accessibility (headings, labels, ARIA sections)                     | PASS (component)      |
| Responsive layout (existing shell)                                  | PASS (structure)      |

## Playwright

Spec: `testing/playwright/e2e/apztcms-018-pipeline-workbench.spec.ts` (mock provider routes).

**Session result:** webServer failed to start — pre-existing Next.js dynamic slug conflict (`resourceType` !== `relationshipId` under testing API routes). Documented limitation; not introduced by APZTCMS-019.

## Exclusions

No workflow editing, dispatch, rerun, cancel controls in UI.
