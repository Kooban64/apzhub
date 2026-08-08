# WF-H3 — Performance smoke

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-H3**        |
| Status | **Closed**       |
| Date   | 20260808T151500Z |

## Spec

`testing/playwright/e2e/apz-workflow-v10-hardening.spec.ts` — describe **WF-H3**

| Budget                                          | Value    |
| ----------------------------------------------- | -------- |
| Warm-shell h1 ready (after one warm navigation) | ≤ 5000ms |

Surfaces measured: Home, Journeys, Templates, Monitoring.

## Result

**PASS** — budgets met; no optimisation required (20260808).
