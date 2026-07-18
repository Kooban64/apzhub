# APZSEARCH-004 Coverage Baseline

**Date:** 2026-07-14  
**Package:** `@apzhub/integration-search-sdk` **0.1.0**

## Command

```bash
pnpm exec vitest run --coverage \
  --coverage.include='packages/integration-search-sdk/src/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.test.ts' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=80 \
  --coverage.thresholds.statements=95 \
  packages/integration-search-sdk
```

## Result

| Metric     | Coverage |
| ---------- | -------- |
| Statements | 98.01%   |
| Branches   | 93.8%    |
| Functions  | 97.79%   |
| Lines      | 98.01%   |

Thresholds (≥95% lines/statements, ≥90% functions, ≥80% branches): **PASS**

## Notes

- Coverage is package-scoped to SDK sources; `*.test.ts` excluded.
- Uncovered lines are primarily default no-op vendor hooks and rare platform-registration failure branches.
- Audit: `pnpm audit:search-integration-sdk` — PASS (0 violations).
