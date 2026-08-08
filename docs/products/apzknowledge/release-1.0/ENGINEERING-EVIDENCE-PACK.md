# APZ Knowledge V1.0 — Engineering Evidence Pack

| Field  | Value                          |
| ------ | ------------------------------ |
| Slice  | **APZKNW-402** / **KNW-RL-02** |
| Status | **Prepared**                   |
| Date   | 20260808T194000Z               |

## Phase index

| Phase                 | IDs          | Evidence directory                                   |
| --------------------- | ------------ | ---------------------------------------------------- |
| Product functionality | KNW-P1-01…04 | [../engineering/evidence/](../engineering/evidence/) |
| Production readiness  | KNW-PR-01…06 | same                                                 |
| Hardening             | KNW-H1…H5    | same                                                 |

## Automated proof

```bash
pnpm exec vitest run \
  apps/web/components/knowledge/knowledge-daily-path.test.ts \
  apps/web/lib/api/v1/handlers/require-knowledge-permission.test.ts \
  packages/platform-services/src/services/organisational-memory/resolve-organisational-memory-store.test.ts \
  packages/platform-services/src/services/organisational-memory/organisational-memory.test.ts

pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/apz-knowledge-v10-hardening.spec.ts
```

Hardening Playwright: **4/4 PASS** (20260808T194000Z).
