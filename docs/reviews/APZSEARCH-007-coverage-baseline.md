# APZSEARCH-007 Coverage Baseline

| Field | Value |
| --- | --- |
| **Milestone** | APZSEARCH-007 |
| **Date** | 2026-07-14 |
| **Scope** | Search HTTP handlers/schemas, typed client (`lib/search`), Workbench (`components/search`) |
| **Excluded** | `**/*.{test,spec}.{ts,tsx}`, type-only `search-types.ts` |

## Command

```bash
pnpm exec vitest run --coverage \
  --coverage.include='apps/web/lib/api/v1/handlers/search.ts' \
  --coverage.include='apps/web/lib/api/v1/schemas/search.ts' \
  --coverage.include='apps/web/lib/search/**/*.{ts,tsx}' \
  --coverage.include='apps/web/components/search/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.{test,spec}.{ts,tsx}' \
  --coverage.exclude='**/search-types.ts' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.statements=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=70 \
  apps/web/lib/api/v1/handlers/search apps/web/lib/search apps/web/components/search
```

## Results (final)

| Metric | Value | Target |
| --- | --- | --- |
| Statements | **98.73%** | ≥95% |
| Lines | **98.73%** | ≥95% |
| Branches | **86.97%** | ≥70% |
| Functions | **100%** | ≥90% |
| Tests | **29 PASS** (4 files) | — |

### Suite breakdown

| Suite | Location | Tests | Coverage (lines) |
| --- | --- | --- | --- |
| Handlers | `apps/web/lib/api/v1/handlers/search.test.ts` | 8 | **97.28%** (`search.ts`) |
| Schemas | exercised via handlers | — | **97.83%** (`schemas/search.ts`) |
| Typed client + helpers | `apps/web/lib/search/*.test.ts` | 9 | **99.23%** (`lib/search`; mock **100%**) |
| Workbench | `apps/web/components/search/platform-search-view.test.tsx` | 12 | **100%** view / **100%** router |
| Combined | above | **29** | Statements **98.73%** / Lines **98.73%** / Functions **100%** / Branches **86.97%** |
| Playwright | `testing/playwright/e2e/apzsearch-007-platform-search-workbench.spec.ts` | 2 (mocked HTTP) | **LIMITED** if Next webServer blocked by pre-existing slug conflict |
| OpenAPI | `pnpm openapi:validate:platform` + audit parity | pass | Spec **1.1.0**, tag Platform Search |
| Audits | `pnpm audit:search-http` / `pnpm audit:search-workbench` | 0 violations | |

### Key modules

| Module | Statements | Lines | Branches | Functions |
| --- | --- | --- | --- | --- |
| `handlers/search.ts` | 97.28% | 97.28% | 94.33% | 100% |
| `schemas/search.ts` | 97.83% | 97.83% | 87.50% | 100% |
| `lib/search/search-client.ts` | 98.76% | 98.76% | 74.65% | 100% |
| `lib/search/search-api.ts` | 99.00% | 99.00% | 95.00% | 100% |
| `lib/search/mock-search-client.ts` | 100% | 100% | 95.83% | 100% |
| `lib/search/highlight.ts` | 100% | 100% | 100% | 100% |
| `lib/search/search-errors.ts` | 100% | 100% | 100% | 100% |
| `lib/search/routes.ts` | 100% | 100% | 100% | 100% |
| `components/search/platform-search-view.tsx` | 100% | 100% | 91.09% | 100% |
| `components/search/search-workspace-router.tsx` | 100% | 100% | 100% | 100% |

### Residual uncovered (accepted)

| Location | Lines | Rationale |
| --- | --- | --- |
| `search-client.ts` | 322–326 | Defensive `INVALID_CLIENT_PATH` guard; all public methods use `/api/v1/search` prefixes |
| `search-api.ts` | 34 | Non-test `createHttpSearchClient()` init branch (tests use mock client) |

Package bumps: none for search-contracts / platform-services / meilisearch (HTTP-only milestone). OpenAPI info version **1.1.0**.

## Notes

- Mock HTTP `fetch` / mock typed client only — no live Meilisearch.
- Workbench coverage includes filter/sort/phrase/facets/pagination **client request mapping**, management/profile views, empty/error/unauthorized/degraded readiness, and Retry paths.
- Pre-existing dynamic-route slug conflict (`testing/traceability/[relationshipId]` vs `[resourceType]/[resourceId]`) may prevent Next production `build` / Playwright `webServer`. Not introduced by APZSEARCH-007.
