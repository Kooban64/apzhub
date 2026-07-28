# APZHUB-ENG-0017 — Quality Evidence

> **Programme:** APZHUB-ENG-0017  
> **Date:** 2026-07-21  
> **Scope:** RG-CERT-PIN-DRIFT certification / wave / OpenAPI pin suites only

## Gates

| Gate                            | Scope                                                                                        | Result               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| Vitest (pin-scope)              | 36 files · admin/config/identity/metrics/notify/observe/search/support/workflow/sdk/handlers | **280/280 PASS**     |
| Vitest (version constant smoke) | platform-services task + workflow-002 tests                                                  | **25/25 PASS**       |
| Lint (affected)                 | handlers + create-platform-services + support cert                                           | **PASS**             |
| Typecheck                       | `@apzhub/platform-services`                                                                  | **PASS**             |
| Playwright                      | Not in RG-CERT-PIN-DRIFT scope                                                               | **N/A**              |
| Architecture / compatibility    | Wave audits re-run via certification harness                                                 | **PASS** (pin-scope) |

## Baseline → after

| Metric       | Before (pin-scope re-run) |   After |
| ------------ | ------------------------: | ------: |
| Failed tests |                        50 |   **0** |
| Passed tests |                       230 | **280** |

## Logs

| Artefact      | Path                             |
| ------------- | -------------------------------- |
| Pin baseline  | `/tmp/eng-0017/pin-baseline.log` |
| Pin final     | `/tmp/eng-0017/pin-final.log`    |
| Version smoke | `/tmp/eng-0017/ps-version.log`   |
| Lint          | `/tmp/eng-0017/lint-scope.log`   |
| Typecheck     | `/tmp/eng-0017/typecheck-ps.log` |

## Remaining (out of scope)

| Class             |                        Remaining vs CERT-001 after ENG-0016+0017 |
| ----------------- | ---------------------------------------------------------------: |
| Playwright hard   |                                                           **12** |
| Playwright flaky  |                                                           **30** |
| Vitest (non-pin)  | **32** (82 − 50) — Law API authz · Law search int · Testing arch |
| Lint / TypeScript |                              **0** / **0** (cleared in ENG-0016) |
