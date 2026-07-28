# APZHUB-ENG-0019 — Remediation Evidence

> **Programme:** APZHUB-ENG-0019  
> **Date:** 2026-07-21

## Group

| Identifier             | Status         | Evidence                                                                                                                |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| RG-AUTH-SHELL-RESIDUAL | **REMEDIATED** | SPR-003/005 hard cases PASS; API-first `signInDevUser`; workbench Overview focus preserved; Personalisation layout poll |

## Inventory IDs cleared

| IDs            | Count | Class                                    |
| -------------- | ----: | ---------------------------------------- |
| QA2-F-016…019  |     4 | Playwright hard                          |
| QA2-FL-001…030 |    30 | Playwright flaky (auth/shell root cause) |

## Repository impact (paths)

- `testing/playwright/e2e/auth-helpers.ts`
- `testing/playwright/e2e/{support,time,projects}-ui-cert-helpers.ts`
- `testing/playwright/e2e/{analytics,workflow}-workbench-helpers.ts`
- `testing/playwright/e2e/accessibility.spec.ts`
- `testing/playwright/e2e/oss-110-13-support-module.spec.ts` (sign-in only)
- `testing/playwright/e2e/spr-003-workbench-*.spec.ts`
- `testing/playwright/e2e/spr-005-knowledge-discovery-framework.spec.ts`
- `apps/web/components/workbench-page.tsx`

## Durable evidence

[docs/operations/evidence/portfolio-recert/20260721T151949Z-APZHUB-ENG-0019-RG-AUTH-SHELL-RESIDUAL.json](../../operations/evidence/portfolio-recert/20260721T151949Z-APZHUB-ENG-0019-RG-AUTH-SHELL-RESIDUAL.json)
