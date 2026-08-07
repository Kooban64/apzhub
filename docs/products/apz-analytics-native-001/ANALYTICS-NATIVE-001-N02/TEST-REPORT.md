# Test Report — APZ-ANALYTICS-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Timestamp | 20260805T181500Z |

## Coverage

| Area               | Evidence                                                         |
| ------------------ | ---------------------------------------------------------------- |
| Permission helpers | `apps/web/lib/analytics/permissions.test.ts`                     |
| Session hook       | `use-analytics-permissions.ts` (Workflow/Documents N-02 pattern) |
| Product chrome     | `ANALYTICS_PRODUCT_NAME` on PageShell / router denied            |

## Assertions

- `analytics.view` does **not** imply datasets / reports / health
- `analytics.admin` opens presentation assets and operator surfaces
- Empty / undefined source denies product entry
- `analytics.*` wildcard still honoured for elevated operators
