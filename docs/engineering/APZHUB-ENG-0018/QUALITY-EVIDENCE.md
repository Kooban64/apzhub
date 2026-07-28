# APZHUB-ENG-0018 — Quality Evidence

> **Programme:** APZHUB-ENG-0018  
> **Date:** 2026-07-21  
> **Scope:** RG-LAW-API-AUTHZ + RG-LAW-SEARCH-INT certification suites only

## Gates

| Gate                         | Scope                                                                                                 | Result         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------------- |
| Vitest (authz + search)      | 10 files · Law API + Law search/lifecycle                                                             | **75/75 PASS** |
| Lint (affected)              | helpers + 5 API tests + 5 Law search/integration tests                                                | **PASS**       |
| TypeScript                   | `apps/web` · `apps/law-platform`                                                                      | **PASS**       |
| Playwright                   | Not in these remediation groups                                                                       | **N/A**        |
| Architecture / compatibility | No production PermissionService or search-scope redesign; ENG-0007 session-only tenant scope retained | **PASS**       |

## Baseline → after

| Metric       | Before (scope re-run) |  After |
| ------------ | --------------------: | -----: |
| Failed tests |                **31** |  **0** |
| Passed tests |                    44 | **75** |

### Previously failing (now passing)

- Law API authz (**24**): trust · clients · calendar-events · invoices · time-entries
- Law search int (**7**): workflow · palette · calendar search provider · matter lifecycle · tenant isolation (bound case)

## Logs

| Artefact      | Path                                       |
| ------------- | ------------------------------------------ |
| Baseline      | `/tmp/eng-0018/law-baseline.log`           |
| Final         | `/tmp/eng-0018/law-authz-search-final.log` |
| ESLint        | `/tmp/eng-0018/eslint-final.log`           |
| Typecheck web | `/tmp/eng-0018/web-tsc-final.log`          |
| Typecheck law | `/tmp/eng-0018/law-tsc-final.log`          |

## Remaining (out of scope)

| Class             | Remaining vs CERT-001 after ENG-0016…0018 |
| ----------------- | ----------------------------------------: |
| Playwright hard   |                                    **12** |
| Playwright flaky  |                                    **30** |
| Vitest            |                   **1** (RG-TESTING-ARCH) |
| Lint / TypeScript |                             **0** / **0** |
