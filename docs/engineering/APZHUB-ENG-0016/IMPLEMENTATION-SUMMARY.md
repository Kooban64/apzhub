# APZHUB-ENG-0016 — Implementation Summary

> **Programme:** APZHUB-ENG-0016  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Groups:** RG-LAW-SUITE-SCOPE · RG-LAW-HOST-QUALITY

## Preconditions verified

| Check                        | Result                                   |
| ---------------------------- | ---------------------------------------- |
| APZHUB-QA-RECERT-002         | **ACCEPTED** (Owner Decision)            |
| ENGINEERING-PLAN Step 1      | RG-LAW-SUITE-SCOPE + RG-LAW-HOST-QUALITY |
| Groups repository-approved   | Yes (residual-analysis pack)             |
| Status before implementation | **OPEN**                                 |
| Dependencies                 | None for both groups                     |
| Other groups authorised      | **No**                                   |

## STEP 2 — Group contracts

### RG-LAW-SUITE-SCOPE

| Field                      | Value                                                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-LAW-SUITE-SCOPE                                                                                                                              |
| Title                      | Law Trust suite scope correction                                                                                                                |
| Root cause                 | RCA-01 — `law-015` under main E2E (:3300) with Law origin helpers (:3302) → Better Auth Invalid origin                                          |
| Included failures          | QA2-F-002…008 (7 Playwright hard)                                                                                                               |
| Affected packages          | `testing/playwright`                                                                                                                            |
| Affected products          | APZ Law                                                                                                                                         |
| Affected platform services | Law Trust / Auth (test portfolio only)                                                                                                          |
| Dependencies               | None                                                                                                                                            |
| Acceptance criteria        | `law-015` ignored by main `playwright.config.ts`; still matched by `playwright.law.config.ts`; Law Trust suite passes under `pnpm test:e2e:law` |
| Architecture impact        | None — test portfolio hygiene only                                                                                                              |
| SemVer impact              | None                                                                                                                                            |
| Est. reduction             | 7 Playwright hard failures                                                                                                                      |

### RG-LAW-HOST-QUALITY

| Field                      | Value                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-LAW-HOST-QUALITY                                                                                 |
| Title                      | Law host lint and TypeScript hygiene                                                                |
| Root cause                 | RCA-03 — unused import; TS2493 on Vitest mock call tuple                                            |
| Included failures          | QA2-L-001 · QA2-T-001                                                                               |
| Affected packages          | `apps/law-platform`                                                                                 |
| Affected products          | APZ Law                                                                                             |
| Affected platform services | Law Persistence (hygiene only)                                                                      |
| Dependencies               | None                                                                                                |
| Acceptance criteria        | Full lint green for prior error; law-platform typecheck green; affected persistence unit tests pass |
| Architecture impact        | None                                                                                                |
| SemVer impact              | None                                                                                                |
| Est. reduction             | 1 lint + 1 typecheck                                                                                |

## Changes

### RG-LAW-SUITE-SCOPE

- Added `testIgnore: [/law-015-trust-workflow\.spec\.ts/]` to `testing/playwright/playwright.config.ts`.
- Left `playwright.law.config.ts` `testMatch` unchanged (`pnpm test:e2e:law`).

### RG-LAW-HOST-QUALITY

- Removed unused `setSessionLawPersistenceContext` import from `law-persistence-scope.ts` (re-export retained).
- Fixed `r12-persist-02-boundary.test.ts` mock call access to avoid TS2493 empty-tuple index.

## Repository impact

| Area                                     | Impact    |
| ---------------------------------------- | --------- |
| Platform architecture                    | Unchanged |
| Package boundaries                       | Unchanged |
| Public APIs / DB / SemVer                | Unchanged |
| Integration / Platform Service contracts | Unchanged |

## Result

Both authorised groups **implemented**. Recommendation: **READY FOR OWNER ACCEPTANCE**.
