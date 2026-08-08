# QX-HD-01 / H1 — Functional Regression

| Field     | Value                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| Timestamp | 20260808T055500Z                                                                                           |
| Status    | **CLOSED**                                                                                                 |
| Suite     | `testing/playwright/e2e/apzqep-v11-quality-flow-workspace.spec.ts` · `apzqep-v11-product-journeys.spec.ts` |
| Result    | **8/8 passed** (chromium)                                                                                  |

---

## Journeys covered

| Surface                            | Journey                                  | Result |
| ---------------------------------- | ---------------------------------------- | ------ |
| Quality Flow Workspace             | Command centre active + waiting          | PASS   |
| Quality Flow Workspace             | Flow detail (stage, approvals, timeline) | PASS   |
| Quality Flow Workspace             | Axe critical/serious = 0                 | PASS   |
| Automation                         | Home lists executions                    | PASS   |
| SCM                                | Home lists repositories                  | PASS   |
| Quality Intelligence               | Home lists recommendations               | PASS   |
| Dashboards                         | Home + detail honest-empty KPI           | PASS   |
| Automation / SCM / QI / Dashboards | Axe critical/serious = 0                 | PASS   |

No intermittent failures observed on the recorded run.

Supporting fix: `QepTable` scroll region keyboard access + row `href` linking (`apps/web/components/qep/qep-ui.tsx`).
