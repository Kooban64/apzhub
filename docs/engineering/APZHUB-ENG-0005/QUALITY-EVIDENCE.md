# APZHUB-ENG-0005 — Quality Evidence

> **Programme:** APZHUB-ENG-0005  
> **Date:** 2026-07-20  
> **Scope:** R12-QA-01 only

---

## Commands executed

| Gate               | Command                                                                          | Result                                    |
| ------------------ | -------------------------------------------------------------------------------- | ----------------------------------------- |
| Typecheck          | `pnpm --filter @apzhub/platform-operations typecheck`                            | **PASS**                                  |
| Lint               | `pnpm --filter @apzhub/platform-operations lint`                                 | **PASS**                                  |
| Unit               | `pnpm exec vitest run packages/platform-operations/src/portfolio-recert.test.ts` | **PASS** (6 tests)                        |
| Re-cert path       | `pnpm ops:portfolio-recert -- --mode path`                                       | **PASS**                                  |
| Re-cert docker     | `pnpm ops:portfolio-recert -- --mode docker`                                     | **PASS**                                  |
| Re-cert playwright | `pnpm ops:portfolio-recert -- --mode playwright`                                 | **FAIL** (suite exit 1; evidence written) |
| Architecture       | Process/CI only; no layer bypass; no SDK unfreeze                                | **PASS**                                  |
| Compatibility      | Platform 1.2.0 packaging unchanged; no public API mutation                       | **PASS**                                  |

---

## Portfolio re-cert evidence

| Mode           | Verdict | Artefact                                                                                                                                      |
| -------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| path           | PASS    | [20260720T170309Z-R12-QA-01-path-PASS.json](../../operations/evidence/portfolio-recert/20260720T170309Z-R12-QA-01-path-PASS.json)             |
| docker         | PASS    | [20260720T170327Z-R12-QA-01-docker-PASS.json](../../operations/evidence/portfolio-recert/20260720T170327Z-R12-QA-01-docker-PASS.json)         |
| playwright     | FAIL    | [20260720T174042Z-R12-QA-01-playwright-FAIL.json](../../operations/evidence/portfolio-recert/20260720T174042Z-R12-QA-01-playwright-FAIL.json) |
| classification | —       | [FAILURE-CLASSIFICATION](../../operations/evidence/portfolio-recert/20260720T174042Z-R12-QA-01-playwright-FAILURE-CLASSIFICATION.md)          |

Playwright host summary: **77 passed** · **55 failed** · **1 flaky** (~36.9m). Failures classified primarily as **environment** (auth/shell instability); minority **product_defect** (mocked relative URL fetch). **No in-scope product fixes** under ENG-0005.

---

## Architecture verification

| Rule                                    | Evidence                                           |
| --------------------------------------- | -------------------------------------------------- |
| No product redesign                     | Ops path + evidence only                           |
| No Platform Service / connector changes | Diff limited to platform-operations + scripts/docs |
| No STOP themes                          | Email / FIN / Execute untouched                    |
| Host coexistence                        | Docker stage uses APZHUB compose only              |
