# APZCONFIG-001 Coverage Baseline

**Date:** 2026-07-16  
**Target:** ≥95% lines/functions · ≥80% branches

## Measured

Scoped to `packages/configuration-*/src/**` (excluding type-only `domain/`, `common/`, `services/`):

| Metric     |   Combined |
| ---------- | ---------: |
| Lines      | **95.48%** |
| Statements | **95.48%** |
| Functions  | **95.32%** |
| Branches   | **81.61%** |

## Audit

```bash
pnpm audit:configuration-foundation
# RESULT: PASS
```
