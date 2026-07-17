# APZSEARCH-014 — Coverage Baseline

**Date:** 2026-07-15  
**Package:** `@apzhub/search-reporting` **0.1.0**

| Metric | Coverage |
| ------ | -------- |
| **Statements** | **96.72%** |
| **Branches** | **82.74%** |
| **Functions** | **100%** |
| **Lines** | **96.72%** |

**Verdict:** PASS (≥95% lines/statements/functions; ≥80% branches).

Scoped command:

```bash
pnpm exec vitest run --config vitest.config.ts --coverage \
  --coverage.include='packages/search-reporting/src/**' \
  --coverage.thresholds.lines=95 --coverage.thresholds.functions=95 \
  --coverage.thresholds.branches=80 --coverage.thresholds.statements=95 \
  packages/search-reporting
```
