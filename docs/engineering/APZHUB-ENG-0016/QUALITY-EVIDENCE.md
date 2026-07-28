# APZHUB-ENG-0016 — Quality Evidence

> **Programme:** APZHUB-ENG-0016  
> **Date:** 2026-07-21  
> **Scope:** Affected suites for RG-LAW-SUITE-SCOPE + RG-LAW-HOST-QUALITY only

## Gates executed

| Gate                   | Scope                                                                           | Result                         |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| Lint (affected files)  | law-persistence-scope · boundary test · playwright.config                       | **PASS**                       |
| Lint (full repo)       | `pnpm lint`                                                                     | **PASS** (exit 0)              |
| Typecheck              | `@apzhub/law-platform`                                                          | **PASS** (exit 0)              |
| Unit                   | `r12-persist-02-boundary.test.ts` + `persistence-hardening.test.ts`             | **10/10 PASS**                 |
| Playwright list (main) | `playwright.config.ts --list`                                                   | **126 tests · law-015 absent** |
| Playwright list (law)  | `playwright.law.config.ts --list`                                               | **7 tests · law-015 present**  |
| Playwright Law Trust   | `pnpm test:e2e:law`                                                             | **7/7 PASS** (~1.0m)           |
| Architecture           | Portfolio hygiene only — no service/connector/module boundary change            | **N/A PASS** (unchanged)       |
| Compatibility          | Main suite no longer discovers Law Trust; Law suite retains exclusive ownership | **PASS**                       |

## Logs

| Artefact           | Path                                   |
| ------------------ | -------------------------------------- |
| Lint full          | `/tmp/eng-0016/lint-full.log`          |
| Typecheck law      | `/tmp/eng-0016/typecheck-law.log`      |
| Vitest persistence | `/tmp/eng-0016/vitest-persistence.log` |
| Main PW list       | `/tmp/eng-0016/pw-main-list.log`       |
| Law PW list        | `/tmp/eng-0016/pw-law-list.log`        |
| Law PW run         | `/tmp/eng-0016/pw-law-run.log`         |

## Previously failing → now addressed

| ID            | Prior                                            | After ENG-0016                                              |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| QA2-F-002…008 | 7 hard fails in main `test:e2e` (Invalid origin) | Excluded from main suite; **7/7 PASS** under `test:e2e:law` |
| QA2-L-001     | Lint error unused import                         | **Cleared** (full lint PASS)                                |
| QA2-T-001     | TS2493 law-platform typecheck                    | **Cleared** (law-platform typecheck PASS)                   |

## Remaining (out of scope — not authorised)

| Class            | Remaining (vs CERT-001 baseline after this programme) |
| ---------------- | ----------------------------------------------------- |
| Playwright hard  | **12** (19 − 7)                                       |
| Playwright flaky | **30** (unchanged)                                    |
| Vitest           | **82** (unchanged)                                    |
| Lint             | **0** (was 1)                                         |
| TypeScript       | **0** (was 1)                                         |

Not re-run: full portfolio `test:e2e` / full Vitest / ENG-0017+ groups.
