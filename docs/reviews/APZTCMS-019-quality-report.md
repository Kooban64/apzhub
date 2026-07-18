# APZTCMS-019 — Quality Report

**Date:** 2026-07-12  
**Verdict:** **PASS** with documented limitations

---

## Regression

| Suite                                                                               | Result         |
| ----------------------------------------------------------------------------------- | -------------- |
| GitHub vertical Vitest (17 files)                                                   | **103 passed** |
| OpenAPI validate                                                                    | **valid**      |
| Typecheck (contracts, testing-services, github-actions, platform-service-contracts) | **PASS**       |
| Lint (github-actions)                                                               | **PASS**       |
| Architecture boundary tests                                                         | **PASS**       |

## Coverage (scoped)

| Layer                                     | Statements/Lines | Functions  | Branches   |
| ----------------------------------------- | ---------------- | ---------- | ---------- |
| `@apzhub/integration-github-actions`      | **95.62%**       | **99.31%** | **82.13%** |
| Platform GitHub providers + live services | **100%**         | **100%**   | **94.93%** |
| Domain `pipelines/`                       | **98.35%**       | **100%**   | **82.18%** |
| apps/web pipeline presentation modules    | **97.13%**       | **90.6%**  | **68.24%** |

## Quality gates

| Gate                                                                     | Result              |
| ------------------------------------------------------------------------ | ------------------- |
| typecheck (vertical packages)                                            | PASS                |
| lint (adapter)                                                           | PASS                |
| tests                                                                    | PASS                |
| coverage (≥95% lines on adapter/providers/domain/presentation aggregate) | PASS                |
| OpenAPI                                                                  | PASS                |
| Playwright live                                                          | LIMITED             |
| Architecture / dependency / boundary                                     | PASS (0 violations) |
| Security audit                                                           | PASS                |

## Technical debt affecting quality

- Live Playwright blocked by pre-existing Next.js dynamic route slug conflict
- Full `platform-services` package typecheck still has Plane/Zammad harness noise
- Presentation function coverage slightly below 95% on view callbacks alone
