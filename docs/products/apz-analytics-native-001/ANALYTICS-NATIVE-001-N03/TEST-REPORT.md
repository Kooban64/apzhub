# Test Report — APZ-ANALYTICS-NATIVE-001-N03

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-03             |
| Timestamp | 20260805T183000Z |
| Result    | **PASS**         |

## Unit / component

| Area                     | Evidence                                                                |
| ------------------------ | ----------------------------------------------------------------------- |
| Enterprise questions     | `apps/web/lib/analytics/enterprise-questions.test.ts`                   |
| Routes                   | `apps/web/lib/analytics/routes.test.ts`                                 |
| Home (question-first)    | `apps/web/components/analytics/analytics-home-view.test.tsx`            |
| Navigation / admin gates | `apps/web/components/analytics/analytics-navigation.test.ts`            |
| Architecture boundary    | `apps/web/components/analytics/analytics-architecture-boundary.test.ts` |
| Permissions (N-02)       | `apps/web/lib/analytics/permissions.test.ts`                            |

All Analytics vitest suites: **17 passed**.

## E2E

| Spec                                                        | Update                                                                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `testing/playwright/e2e/apzhub-analytics-workbench.spec.ts` | Question-first home, catalogue, Decision Context, horizons, help/settings; suite retained as insight-answer deep link |
