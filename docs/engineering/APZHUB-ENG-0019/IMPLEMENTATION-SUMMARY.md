# APZHUB-ENG-0019 — Implementation Summary

> **Programme:** APZHUB-ENG-0019  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Group:** RG-AUTH-SHELL-RESIDUAL

## Preconditions verified

| Check                        | Result                                   |
| ---------------------------- | ---------------------------------------- |
| APZHUB-ENG-0018              | **ACCEPTED** (Owner Decision)            |
| ENGINEERING-PLAN Step 4      | RG-AUTH-SHELL-RESIDUAL                   |
| Group repository-approved    | Yes                                      |
| Status before implementation | **OPEN**                                 |
| Dependencies                 | None (independent of Law/Support groups) |

## STEP 2 — Group contract

| Field                      | Value                                                                                                                                                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-AUTH-SHELL-RESIDUAL                                                                                                                                                                                                                          |
| Title                      | Auth and shell E2E residual stabilisation                                                                                                                                                                                                       |
| Root cause                 | RCA-05 — Better Auth UI sign-in races (`Invalid password` / browser-closed during `page.goto`); shell deep-link fallback overwrote Overview focus; session persistence asserted against obsolete localStorage after M8-04 Personalisation store |
| Included failures          | QA2-F-016…019 (**4** hard) · QA2-FL-001…030 (**30** flaky)                                                                                                                                                                                      |
| Affected packages          | `testing/playwright` · `apps/web` (workbench shell)                                                                                                                                                                                             |
| Affected products          | Platform Shell                                                                                                                                                                                                                                  |
| Affected platform services | Auth (Better Auth) · Workbench · Personalisation (session layout SoR — test assertion alignment)                                                                                                                                                |
| Dependencies               | None                                                                                                                                                                                                                                            |
| Acceptance criteria        | Hard SPR-003/005 auth-shell cases PASS; shared API-first DEV sign-in; no browser-closed cascade in `signInDevUser`; shell Overview focus preserved                                                                                              |
| Architecture impact        | Minimal — remove incorrect nested-route fallback in workbench-page; harness/helpers only otherwise                                                                                                                                              |
| SemVer impact              | None                                                                                                                                                                                                                                            |
| Est. reduction             | **4** Playwright hard + **30** flaky                                                                                                                                                                                                            |

## Changes (summary)

1. **API-first DEV sign-in** in `auth-helpers.ts` (Law ENG-0007 pattern) — Origin-aware `/api/auth/sign-in/email`; UI `pressSequentially` last resort; closed-page guards.
2. **Product/UI cert helpers** (Support/Time/Projects/Analytics/Workflow) + `accessibility.spec.ts` / `oss-110-13` local sign-in delegate to `signInDevUser`.
3. **Shell bugfix:** `workbench-page.tsx` no longer falls back nested routes to workspace root (was wiping `/workspace/home/overview` → Home).
4. **SPR-003 context test** polls Personalisation `workbench-layout` API (M8-04), not localStorage.
5. **SPR-005 knowledge nav** recovers to Home Overview when Administration Overview ranks first.

## Result

RG-AUTH-SHELL-RESIDUAL **implemented**. Recommendation: **READY FOR OWNER ACCEPTANCE**.
