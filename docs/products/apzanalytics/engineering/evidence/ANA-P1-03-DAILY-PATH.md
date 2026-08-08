# ANA-P1-03 — Decision Companion daily path

| Field  | Value            |
| ------ | ---------------- |
| ID     | **ANA-P1-03**    |
| Slice  | **APZAN-103**    |
| Status | **Closed**       |
| Date   | 20260808T185500Z |

## Happy path

```text
/workspace/analytics
  → /workspace/analytics/questions
  → /workspace/analytics/questions/{id}
  → /workspace/analytics/dashboards/{id}   (evidence metadata)
```

## Tests

- `apps/web/components/analytics/analytics-daily-path.test.ts`
- Playwright: `testing/playwright/e2e/apzhub-analytics-workbench.spec.ts`
