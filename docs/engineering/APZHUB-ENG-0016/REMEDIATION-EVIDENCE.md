# APZHUB-ENG-0016 — Remediation Evidence

> **Programme:** APZHUB-ENG-0016  
> **Baseline:** Platform **1.2.0**

## Groups closed

| Identifier          | Status         | Evidence                                                                                |
| ------------------- | -------------- | --------------------------------------------------------------------------------------- |
| RG-LAW-SUITE-SCOPE  | **REMEDIATED** | Main config `testIgnore`; Law config still owns suite; `pnpm test:e2e:law` **7 passed** |
| RG-LAW-HOST-QUALITY | **REMEDIATED** | Lint + typecheck hygiene; persistence unit tests **10 passed**                          |

## Root causes addressed

| RCA    | Summary                                          |
| ------ | ------------------------------------------------ |
| RCA-01 | Law Trust suite mis-scoped into main E2E         |
| RCA-03 | Law host unused import + TS2493 mock tuple index |

## Diff summary

| File                                                                | Change                                            |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| `testing/playwright/playwright.config.ts`                           | `testIgnore` for `law-015-trust-workflow.spec.ts` |
| `apps/law-platform/lib/persistence/law-persistence-scope.ts`        | Drop unused import; keep re-export                |
| `apps/law-platform/lib/persistence/r12-persist-02-boundary.test.ts` | Safe mock call arg access                         |

## Durable evidence JSON

[docs/operations/evidence/portfolio-recert/20260721T132122Z-APZHUB-ENG-0016-WAVE2.json](../../operations/evidence/portfolio-recert/20260721T132122Z-APZHUB-ENG-0016-WAVE2.json)
