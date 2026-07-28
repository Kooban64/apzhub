# APZHUB-ENG-0019 — Quality Evidence

> **Programme:** APZHUB-ENG-0019  
> **Date:** 2026-07-21  
> **Scope:** RG-AUTH-SHELL-RESIDUAL Playwright / harness suites only

## Gates

| Gate                                                 | Scope                                                                       | Result                        |
| ---------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| Playwright (hard IDs QA2-F-016…019 + SPR auth/shell) | spr-001 · spr-003×3 · spr-004 · spr-005 · spr-006 · spr-007 · accessibility | **PASS** (targeted cert runs) |
| Playwright (hard residual re-check)                  | spr-003 + spr-005 full files                                                | **11/11 PASS**                |
| Playwright (smoke)                                   | accessibility + spr-003 context + spr-005                                   | **8/8 PASS**                  |
| Lint (affected)                                      | auth helpers · SPR specs · workbench-page                                   | **PASS**                      |
| TypeScript                                           | `apps/web`                                                                  | **PASS**                      |
| Vitest                                               | Not in this remediation group                                               | **N/A**                       |
| Architecture / compatibility                         | Shell route activation corrected; Personalisation session SoR unchanged     | **PASS**                      |

## Baseline → after (group scope)

| Class                | Before (CERT-001) |                                                                                              After (ENG-0019) |
| -------------------- | ----------------: | ------------------------------------------------------------------------------------------------------------: |
| QA2-F-016…019 hard   |        **4** fail |                                                                                   **0** (targeted suite PASS) |
| QA2-FL-001…030 flaky |            **30** | Root cause remediations applied (API auth + shell focus); full portfolio flaky re-count deferred to next cert |

## Logs

| Artefact                     | Path                                     |
| ---------------------------- | ---------------------------------------- |
| SPR-003/005 green            | `/tmp/eng-0019/spr-003-005.log`          |
| Smoke                        | `/tmp/eng-0019/spr-smoke.log`            |
| Earlier full SPR (pre-final) | `/tmp/eng-0019/spr-auth-shell-final.log` |
| ESLint                       | `/tmp/eng-0019/eslint-final.log`         |
| Typecheck                    | `/tmp/eng-0019/web-tsc.log`              |

## Remaining (out of scope)

| Class             |                                Remaining vs CERT-001 after ENG-0016…0019 |
| ----------------- | -----------------------------------------------------------------------: |
| Playwright hard   |                           **8** (Support 6 · Observe 1 · Visual inbox 1) |
| Playwright flaky  | **0** attributed to RG-AUTH-SHELL-RESIDUAL (full suite re-cert deferred) |
| Vitest            |                                                  **1** (RG-TESTING-ARCH) |
| Lint / TypeScript |                                                            **0** / **0** |
