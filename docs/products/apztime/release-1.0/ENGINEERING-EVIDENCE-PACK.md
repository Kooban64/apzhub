# APZ Time V1.0 — Engineering Evidence Pack

| Field  | Value                           |
| ------ | ------------------------------- |
| Slice  | **APZTIM-402** / **TIME-RL-02** |
| Status | **Prepared**                    |
| Date   | 20260808T202000Z                |

## Phase index

| Phase                 | IDs           | Evidence directory                                   |
| --------------------- | ------------- | ---------------------------------------------------- |
| Product functionality | TIME-P1-01…04 | [../engineering/evidence/](../engineering/evidence/) |
| Production readiness  | TIME-PR-01…06 | same                                                 |
| Hardening             | TIME-H1…H5    | same                                                 |

## Automated proof

```bash
pnpm exec vitest run \
  apps/web/components/time/time-daily-path.test.ts \
  apps/web/lib/api/v1/handlers/require-time-permission.test.ts \
  apps/web/lib/api/v1/platform-api.time.v1.test.ts

pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/apz-time-v10-hardening.spec.ts
```

Hardening Playwright: **4/4 PASS** (20260808T202000Z).
