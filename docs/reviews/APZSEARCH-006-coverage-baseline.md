# APZSEARCH-006 Coverage Baseline

| Field | Value |
| --- | --- |
| **Milestone** | APZSEARCH-006 |
| **Packages** | `@apzhub/search-contracts` **0.4.0**, `@apzhub/platform-services` **0.18.0**, `@apzhub/integration-meilisearch` **0.1.0** (unchanged) |
| **Date** | 2026-07-14 |
| **Scope** | `packages/platform-services/src/services/search-execution/**/*.{ts,tsx}` excluding tests |

## Command

```bash
pnpm exec vitest run --coverage \
  --coverage.include='packages/platform-services/src/services/search-execution/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.{test,spec}.ts' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=70 \
  --coverage.thresholds.statements=95 \
  packages/platform-services/src/services/search-execution
```

## Results

| Metric | Value | Target |
| --- | --- | --- |
| Statements | **97.75%** | ≥95% |
| Lines | **97.75%** | ≥95% |
| Branches | **88.42%** | ≥70% (scoped) |
| Functions | **100%** | ≥90% |
| Tests | **26 PASS** (2 files) | — |

### Key modules

| Module | Lines |
| --- | --- |
| `meilisearch-search-provider.ts` | **95.41%** |
| `search-execution-provider-resolver.ts` | **95.09%** |
| `search-execution-service-impls.ts` | **99.07%** |
| `create-search-execution-services.ts` | **99.26%** |
| `search-security-filters.ts` | **100%** |

## Notes

- Mock Meilisearch `fetch` only — no live engine.
- Audit: `pnpm audit:search-execution` → 0 violations.
- Typecheck: search-contracts + platform-services + integration-meilisearch PASS.
