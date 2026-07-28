# APZHUB-QA-CERT-002 — Certification Results

> **Programme:** APZHUB-QA-CERT-002  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21

---

## Gate matrix

| Gate               | Command / method                                                 | Result                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Lint               | `pnpm lint`                                                      | **FAIL** (exit 1) — 2 ESLint errors                     |
| Typecheck          | `pnpm typecheck`                                                 | **PASS** (exit 0)                                       |
| Unit + Integration | `pnpm test` (Vitest)                                             | **FAIL** (exit 1) — 1 failed / 5011 passed / 66 skipped |
| Regression         | Vitest suite + Playwright portfolio                              | **FAIL** (non-zero residuals)                           |
| Architecture       | Certification-only; Wave 2 groups closed; path artefacts present | **PASS**                                                |
| Compatibility      | Platform 1.2.0 packaging / public APIs not mutated               | **PASS**                                                |
| Portfolio path     | `pnpm ops:portfolio-recert -- --mode path`                       | **PASS**                                                |
| Portfolio full     | `pnpm ops:portfolio-recert -- --mode full`                       | **FAIL**                                                |

---

## Architecture / compatibility verification

| Concern                            | Result                                           |
| ---------------------------------- | ------------------------------------------------ |
| Platform Architecture              | Unchanged by this programme (certification only) |
| Package Boundaries                 | Unchanged by this programme                      |
| Domain Ownership                   | Unchanged by this programme                      |
| Public APIs                        | Unchanged by this programme                      |
| Integration SDK Contracts          | Unchanged by this programme                      |
| Platform Service Contracts         | Unchanged by this programme                      |
| Database Compatibility             | Unchanged by this programme                      |
| Backward Compatibility             | No packaging mutation                            |
| SemVer Compatibility               | No SemVer bumps by this programme                |
| Platform 1.2.0 Production Baseline | Docs present; baseline remains PRWL              |

---

## Evidence

| Artefact          | Path                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Path PASS         | [20260721T180329Z-R12-QA-01-path-PASS.json](../../operations/evidence/portfolio-recert/20260721T180329Z-R12-QA-01-path-PASS.json)               |
| Full FAIL         | [20260721T183118Z-R12-QA-01-full-FAIL.json](../../operations/evidence/portfolio-recert/20260721T183118Z-R12-QA-01-full-FAIL.json)               |
| Programme summary | [20260721T183157Z-APZHUB-QA-CERT-002-SUMMARY.json](../../operations/evidence/portfolio-recert/20260721T183157Z-APZHUB-QA-CERT-002-SUMMARY.json) |
| Host logs         | `/tmp/qa-cert-002/{lint,typecheck,vitest,path,full-recert}.log`                                                                                 |

---

## Overall Certification Status

# CERTIFICATION FAILED
