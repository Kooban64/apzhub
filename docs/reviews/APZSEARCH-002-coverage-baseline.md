# APZSEARCH-002 Coverage Baseline

**Date:** 2026-07-13  
**Package:** `@apzhub/search-persistence` **0.1.0**

## Command

```bash
pnpm exec vitest run --coverage \
  --coverage.include='packages/search-persistence/src/**/*.{ts,tsx}' \
  --coverage.exclude='**/{*.test.ts,postgres/**,ports.ts,records.ts,types.ts}' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=80 \
  --coverage.thresholds.statements=95 \
  packages/search-persistence
```

## Result

| Metric | Coverage |
|--------|----------|
| Statements | 95.79% |
| Branches | 91.19% |
| Functions | 91.42% |
| Lines | 95.79% |

Thresholds (≥95% lines/statements): **PASS**

Postgres repository drivers are production-wired and typechecked; unit coverage focuses on in-memory + registry + services + factories.
