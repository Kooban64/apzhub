# APZHUB-QA-CERT-001 — Certification Results

> **Programme:** APZHUB-QA-CERT-001  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21

---

## Gate matrix

| Gate               | Command / method                                                     | Result                                                   |
| ------------------ | -------------------------------------------------------------------- | -------------------------------------------------------- |
| Lint               | `pnpm lint`                                                          | **FAIL** (exit 1) — 1 ESLint error                       |
| Typecheck          | `pnpm typecheck`                                                     | **FAIL** (exit 2) — `@apzhub/law-platform`               |
| Unit + Integration | `pnpm test` (Vitest)                                                 | **FAIL** (exit 1) — 82 failed / 4929 passed / 66 skipped |
| Regression         | Vitest suite + Playwright portfolio                                  | **FAIL** (non-zero residuals)                            |
| Architecture       | Path recert artefacts + baseline docs; no engineering mutation       | **PASS**                                                 |
| Compatibility      | Platform 1.2.0 packaging / public APIs not mutated by this programme | **PASS**                                                 |
| Portfolio path     | `pnpm ops:portfolio-recert -- --mode path`                           | **PASS**                                                 |
| Portfolio full     | `pnpm ops:portfolio-recert -- --mode full`                           | **FAIL**                                                 |

---

## Architecture / compatibility verification

| Concern                            | Result                                           |
| ---------------------------------- | ------------------------------------------------ |
| Platform Architecture              | Unchanged by this programme (certification only) |
| Public APIs                        | Unchanged by this programme                      |
| Package Boundaries                 | Unchanged by this programme                      |
| Integration SDK Contracts          | Unchanged by this programme                      |
| Platform Service Contracts         | Unchanged by this programme                      |
| Backward Compatibility             | No packaging mutation                            |
| SemVer Compatibility               | No SemVer bumps by this programme                |
| Platform 1.2.0 Production Baseline | Docs present; baseline remains PRWL              |

---

## Evidence

| Artefact          | Path                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Path PASS         | [20260721T110600Z-R12-QA-01-path-PASS.json](../../operations/evidence/portfolio-recert/20260721T110600Z-R12-QA-01-path-PASS.json)               |
| Full FAIL         | [20260721T120046Z-R12-QA-01-full-FAIL.json](../../operations/evidence/portfolio-recert/20260721T120046Z-R12-QA-01-full-FAIL.json)               |
| Programme summary | [20260721T120154Z-APZHUB-QA-CERT-001-SUMMARY.json](../../operations/evidence/portfolio-recert/20260721T120154Z-APZHUB-QA-CERT-001-SUMMARY.json) |

---

## Overall Certification Status

# CERTIFICATION FAILED
