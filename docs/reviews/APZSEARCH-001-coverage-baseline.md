# APZSEARCH-001 Coverage Baseline

**Date:** 2026-07-13  
**Package:** `@apzhub/search-contracts` **0.1.0**

## Command

```bash
pnpm exec vitest run --coverage \
  --coverage.include='packages/search-contracts/src/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.test.{ts,tsx}' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.functions=95 \
  --coverage.thresholds.branches=90 \
  --coverage.thresholds.statements=95 \
  packages/search-contracts
```

## Result

| Metric | Coverage |
|--------|----------|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

Thresholds (≥95% lines/functions/statements; ≥90% branches): **PASS**
