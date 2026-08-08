# APZ Support V1.0 — Engineering Evidence Pack

| Field  | Value                          |
| ------ | ------------------------------ |
| Slice  | **APZSUP-402** / **SUP-RL-02** |
| Status | **Prepared**                   |
| Date   | 20260808T181000Z               |

## Phase 1 — Product functionality

| ID        | Evidence                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| SUP-P1-01 | [../engineering/evidence/SUP-P1-01-PRODUCT-STATUS-FACE.md](../engineering/evidence/SUP-P1-01-PRODUCT-STATUS-FACE.md)     |
| SUP-P1-02 | [../engineering/evidence/SUP-P1-02-LIMITATION-DISCLOSURE.md](../engineering/evidence/SUP-P1-02-LIMITATION-DISCLOSURE.md) |
| SUP-P1-03 | [../engineering/evidence/SUP-P1-03-DAILY-PATH.md](../engineering/evidence/SUP-P1-03-DAILY-PATH.md)                       |
| SUP-P1-04 | [../engineering/evidence/SUP-P1-04-ATTACHMENT-HONESTY.md](../engineering/evidence/SUP-P1-04-ATTACHMENT-HONESTY.md)       |

## Phase 2 — Production readiness

| ID        | Evidence                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| SUP-PR-01 | [../engineering/evidence/SUP-PR-01-FAIL-CLOSED.md](../engineering/evidence/SUP-PR-01-FAIL-CLOSED.md)                       |
| SUP-PR-02 | [../engineering/evidence/SUP-PR-02-MAPPING-DURABILITY.md](../engineering/evidence/SUP-PR-02-MAPPING-DURABILITY.md)         |
| SUP-PR-03 | [../engineering/evidence/SUP-PR-03-REALTIME-DISPOSITION.md](../engineering/evidence/SUP-PR-03-REALTIME-DISPOSITION.md)     |
| SUP-PR-04 | [../engineering/evidence/SUP-PR-04-MIGRATION-VERIFICATION.md](../engineering/evidence/SUP-PR-04-MIGRATION-VERIFICATION.md) |
| SUP-PR-05 | [../engineering/evidence/SUP-PR-05-API-AUTHZ.md](../engineering/evidence/SUP-PR-05-API-AUTHZ.md)                           |
| SUP-PR-06 | [../engineering/evidence/SUP-PR-06-OPS-READINESS.md](../engineering/evidence/SUP-PR-06-OPS-READINESS.md)                   |

## Phase 3 — Hardening

| ID     | Evidence                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------- |
| SUP-H1 | [../engineering/evidence/SUP-H1-PRODUCT-JOURNEYS.md](../engineering/evidence/SUP-H1-PRODUCT-JOURNEYS.md) |
| SUP-H2 | [../engineering/evidence/SUP-H2-ACCESSIBILITY.md](../engineering/evidence/SUP-H2-ACCESSIBILITY.md)       |
| SUP-H3 | [../engineering/evidence/SUP-H3-PERFORMANCE.md](../engineering/evidence/SUP-H3-PERFORMANCE.md)           |
| SUP-H4 | [../engineering/evidence/SUP-H4-SECURITY.md](../engineering/evidence/SUP-H4-SECURITY.md)                 |
| SUP-H5 | [../engineering/evidence/SUP-H5-OPERATIONAL.md](../engineering/evidence/SUP-H5-OPERATIONAL.md)           |

## Automated proof (sample)

```bash
pnpm exec vitest run apps/web/lib/api/v1/platform-api.support.v1.test.ts \
  apps/web/lib/api/v1/handlers/require-support-permission.test.ts
pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/apz-support-v10-hardening.spec.ts
```

Hardening Playwright: **4/4 PASS** (20260808).
