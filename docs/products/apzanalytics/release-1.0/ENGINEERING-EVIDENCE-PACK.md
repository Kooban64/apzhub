# APZ Analytics V1.0 — Engineering Evidence Pack

| Field  | Value                         |
| ------ | ----------------------------- |
| Slice  | **APZAN-402** / **ANA-RL-02** |
| Status | **Prepared**                  |
| Date   | 20260808T191000Z              |

## Phase index

| Phase                 | IDs          | Evidence directory                                   |
| --------------------- | ------------ | ---------------------------------------------------- |
| Product functionality | ANA-P1-01…04 | [../engineering/evidence/](../engineering/evidence/) |
| Production readiness  | ANA-PR-01…06 | same                                                 |
| Hardening             | ANA-H1…H5    | same                                                 |

## Automated proof (sample)

```bash
pnpm exec vitest run apps/web/lib/api/v1/platform-api.analytics.v1.test.ts \
  apps/web/lib/api/v1/handlers/require-analytics-permission.test.ts \
  apps/web/components/analytics/analytics-daily-path.test.ts
pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/apz-analytics-v10-hardening.spec.ts
```

Hardening Playwright: **4/4 PASS** (20260808).
