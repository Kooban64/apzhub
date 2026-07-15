# APZSEARCH-005 Coverage Baseline

| Field | Value |
| --- | --- |
| **Milestone** | APZSEARCH-005 |
| **Package** | `@apzhub/integration-meilisearch` **0.1.0** |
| **Date** | 2026-07-14 |
| **Scope** | `integrations/meilisearch/src/**/*.{ts,tsx}` excluding `*.test.ts`, type-only files, and `testing/` mock harness |

## Command

```bash
pnpm exec vitest run --coverage \
  --coverage.include='integrations/meilisearch/src/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.{test,spec}.ts' \
  --coverage.exclude='**/meilisearch-api-types.ts' \
  --coverage.exclude='**/meilisearch-fetch.ts' \
  --coverage.exclude='**/testing/**' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=70 \
  --coverage.thresholds.statements=95 \
  integrations/meilisearch
```

## Results

| Metric | Value | Target |
| --- | --- | --- |
| Statements | **95.01%** | ≥95% |
| Lines | **95.01%** | ≥95% |
| Branches | **83.03%** | ≥70% (scoped) |
| Functions | **95.12%** | ≥90% |
| Tests | **27 PASS** (3 files) | — |

## Notes

- Mock REST only — no live Meilisearch.
- Audit: `pnpm audit:meilisearch-adapter`.
- Typecheck: `pnpm --filter @apzhub/integration-meilisearch typecheck` PASS.
