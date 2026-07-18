# APZSEARCH-009 — Coverage Baseline

**Date:** 2026-07-14  
**Package:** `@apzhub/search-integration` **0.1.0**

## Scoped re-measure

```bash
pnpm exec vitest run --coverage \
  --coverage.include='packages/search-integration/src/**/*.ts' \
  --coverage.exclude='**/*.{test,spec}.ts' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.statements=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=80 \
  packages/search-integration
```

| Metric         | Coverage   |
| -------------- | ---------- |
| **Statements** | **95.95%** |
| **Branches**   | **87.74%** |
| **Functions**  | **97.14%** |
| **Lines**      | **95.95%** |

**Verdict:** PASS (≥95% lines/statements; ≥90% functions; ≥80% branches).
