# APZTCMS-020 — Quality Report & Coverage Baseline

**Date:** 2026-07-12  
**Verdict:** **PASS**

---

## Official coverage baseline (future CI/CD adapters must target ≥ these lines)

| Layer | Statements/Lines | Functions | Branches |
| ----- | ---------------- | --------- | -------- |
| Adapter (`integration-github-actions`) | **95.62%** | **99.31%** | **82.13%** |
| Provider + live platform services | **100%** | **100%** | **94.93%** |
| Domain pipelines | **98.35%** | **100%** | **82.18%** |
| HTTP handlers + typed client + presentation | **97.13%** | **90.6%** | **68.24%** |

## Quality gates (APZTCMS-020 re-run)

| Gate | Result |
| ---- | ------ |
| typecheck (vertical packages) | PASS |
| lint (adapter) | PASS |
| tests (vertical) | PASS **103** |
| OpenAPI | PASS |
| architecture / dependency / boundary | PASS **0** violations |
| security review | PASS |
| Playwright live | LIMITED (documented; unrelated Next.js slug conflict) |

## Regressions

No regressions observed vs APZTCMS-019 evidence set.
