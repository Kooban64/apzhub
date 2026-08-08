# KNW-H1 — Playwright product journeys

| Field  | Value            |
| ------ | ---------------- |
| ID     | **KNW-H1**       |
| Status | **Closed**       |
| Date   | 20260808T194000Z |

Spec: `testing/playwright/e2e/apz-knowledge-v10-hardening.spec.ts`  
Helpers: `testing/playwright/e2e/knowledge-workbench-helpers.ts`  
Result: **4/4 PASS** (H1 happy path + denied path included).

Denied path asserts no third-party engine brand leakage (`bookstack`).
