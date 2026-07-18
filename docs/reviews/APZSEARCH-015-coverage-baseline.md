# APZSEARCH-015 — Coverage Baseline

**Date:** 2026-07-15  
**Nature:** Certification aggregation (no new adapter code)  
**Re-measure:** scoped `vitest --coverage` per package

---

## Publication package coverage (015 re-measure)

| Package                      | Version | Statements | Branches   | Functions  | Lines      |
| ---------------------------- | ------- | ---------- | ---------- | ---------- | ---------- |
| `@apzhub/search-integration` | 0.1.0   | **95.80%** | **87.68%** | **97.10%** | **95.80%** |
| `@apzhub/search-projects`    | 0.1.0   | **97.55%** | **93.77%** | **100%**   | **97.55%** |
| `@apzhub/search-support`     | 0.1.0   | **97.58%** | **94.55%** | **100%**   | **97.58%** |
| `@apzhub/search-documents`   | 0.1.0   | **97.01%** | **90.24%** | **100%**   | **97.01%** |
| `@apzhub/search-testing`     | 0.1.1   | **98.04%** | **80.97%** | **100%**   | **98.04%** |
| `@apzhub/search-reporting`   | 0.1.0   | **96.69%** | **82.74%** | **100%**   | **96.69%** |

All packages meet certified thresholds (≥95% lines/statements/functions; ≥80% branches).

## Certification harness

`testing/search-publication` — **19** tests · governance smoke only · no ≥95% requirement on harness itself.

## Commands

```bash
pnpm exec vitest run --coverage --coverage.include='packages/search-integration/src/**' packages/search-integration
pnpm exec vitest run --coverage --coverage.include='packages/search-projects/src/**' packages/search-projects
# …repeat for search-support / search-documents / search-testing / search-reporting
```

## Verdict

Publication ecosystem coverage **PASS**.
