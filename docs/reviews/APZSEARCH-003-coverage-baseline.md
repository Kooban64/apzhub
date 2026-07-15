# APZSEARCH-003 Coverage Baseline

**Date:** 2026-07-14  
**Packages:** `@apzhub/search-persistence` **0.2.0**, `@apzhub/platform-services` search folder

## 1. search-persistence (services + related; postgres drivers excluded)

### Command

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

### Result

| Metric | Coverage |
|--------|----------|
| Statements | 98.23% |
| Branches | 89.16% |
| Functions | 98.96% |
| Lines | 98.23% |

Thresholds (≥95% lines/statements, ≥90% functions, ≥80% branches): **PASS**

Postgres repository drivers remain production-wired and typechecked; unit coverage focuses on in-memory + registry + stub provider + thin platform services + factories.

Notable service file: `platform-services.ts` **98.85%** lines (was ≈28.89%).

## 2. platform-services search folder

### Command

```bash
pnpm exec vitest run --coverage \
  --coverage.include='packages/platform-services/src/services/search/**/*.{ts,tsx}' \
  --coverage.exclude='**/*.test.ts' \
  --coverage.thresholds.lines=95 \
  --coverage.thresholds.functions=90 \
  --coverage.thresholds.branches=80 \
  --coverage.thresholds.statements=95 \
  packages/platform-services/src/services/search
```

### Result

| Metric | Coverage |
|--------|----------|
| Statements | 100% |
| Branches | 98.03% |
| Functions | 100% |
| Lines | 100% |

Thresholds (≥95% lines/statements, ≥90% functions, ≥80% branches): **PASS**

Coverage includes gateway facet wrappers, `mapSearchDomainError` classifications, factory modes (foundation / persistence / test memory / production postgres), authorization denial translation, and management-plane flows without search execution or secret leakage.
