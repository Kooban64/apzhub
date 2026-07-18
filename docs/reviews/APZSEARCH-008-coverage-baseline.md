# APZSEARCH-008 — Coverage Baseline

**Date:** 2026-07-14  
**Verdict:** **PASS WITH LIMITATIONS**  
**Certification:** APZSEARCH-008

---

## Scope

Aggregate prior milestones **APZSEARCH-001–007** coverage baselines plus vertical certification harness metrics. No new Search functionality; coverage re-asserted from prior evidence and harness execution.

## Aggregate (from prior baselines)

| Milestone     | Layer                                         | Statements / Lines         | Branches   | Functions  | Notes                          |
| ------------- | --------------------------------------------- | -------------------------- | ---------- | ---------- | ------------------------------ |
| APZSEARCH-001 | `search-contracts`                            | **100%**                   | **100%**   | **100%**   | PASS                           |
| APZSEARCH-002 | `search-persistence` (excl. postgres drivers) | **95.79%**                 | **91.19%** | **91.42%** | PASS; postgres LIMITED in unit |
| APZSEARCH-003 | persistence services                          | **98.23%**                 | **89.16%** | **98.96%** | PASS                           |
| APZSEARCH-003 | platform-services search mgmt                 | scoped PASS (see baseline) | —          | —          | PASS                           |
| APZSEARCH-004 | `integration-search-sdk`                      | **98.01%**                 | **93.8%**  | **97.79%** | PASS                           |
| APZSEARCH-005 | `integration-meilisearch`                     | **95.01%**                 | **83.03%** | **95.12%** | PASS; mock REST                |
| APZSEARCH-006 | `search-execution`                            | **97.75%**                 | **88.42%** | **100%**   | PASS; mock Meili               |
| APZSEARCH-007 | HTTP + client + Workbench                     | **98.73%**                 | **86.97%** | **100%**   | PASS (≥95% lines target)       |

Sources: `docs/reviews/APZSEARCH-00{1–7}-coverage-baseline.md`.

## Aggregate re-measurement (APZSEARCH-008 — 2026-07-14)

Scoped include over contracts + persistence (excl. postgres drivers) + Search Integration SDK + Meilisearch adapter + platform search management + search-execution + HTTP handlers/schemas + typed client + Workbench components:

| Metric         | Coverage                 |
| -------------- | ------------------------ |
| **Statements** | **97.04%** (9410 / 9697) |
| **Branches**   | **89.33%** (2018 / 2259) |
| **Functions**  | **97.57%** (764 / 783)   |
| **Lines**      | **97.04%** (9410 / 9697) |

**Verdict:** ≥95% lines / statements / functions target **PASS**. Meaningful branches ≥89% (prior layer floors retained; no new functional branches in 008).

## Vertical suite metrics (APZSEARCH-008)

| Suite                                                                               | Result                                                                                                                          |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm audit:search-vertical`                                                        | **PASS** · Violations: **0** (evidence 2026-07-14)                                                                              |
| Certification harness `testing/search-vertical/apzsearch-008-certification.test.ts` | **9 PASS**; asserts audit, routes, client, manifests, omitted routes, versions, slug conflict documentation                     |
| Layered audits 001–007                                                              | **PASS** (version floor update on APZSEARCH-003 audit + foundation harnesses for certified bumps)                               |
| OpenAPI validate                                                                    | **PASS** (`docs/specs/APZHUB-Platform-OpenAPI-v1.yaml is valid`)                                                                |
| Playwright live webServer                                                           | **LIMITED** — external Next slug conflict (dirs present under `testing/traceability/` since 2026-07-12; predates APZSEARCH-008) |

## Gate interpretation

| Gate                                                      | Result                                       |
| --------------------------------------------------------- | -------------------------------------------- |
| Prior scoped layers ≥95% lines (where milestone targeted) | **PASS** (from baselines)                    |
| Vertical audit 0 violations                               | **PASS**                                     |
| Live Meilisearch / live Postgres unit CI                  | **LIMITED** by design                        |
| Playwright against Next webServer                         | **LIMITED** (external Testing slug conflict) |

## Test inventory

| Suite                     | Location                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| Certification harness     | `testing/search-vertical/apzsearch-008-certification.test.ts`            |
| Foundation harnesses      | `testing/search-foundation/apzsearch-00{1,2,3}-*.test.ts`                |
| HTTP / client / Workbench | `apps/web/...` (APZSEARCH-007)                                           |
| Execution                 | `packages/platform-services/.../search-execution/`                       |
| Playwright (mock)         | `testing/playwright/e2e/apzsearch-007-platform-search-workbench.spec.ts` |
