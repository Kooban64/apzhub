# APZADMIN-004 Coverage Baseline

**Date:** 2026-07-16  
**Scope:** `apps/web/components/administration/**`

## Result

| Metric | Workbench components |
| --- | --- |
| Lines | **~99%** |
| Statements | **~99%** |
| Functions | **~95%** |
| Branches | **~87%** |

Measured via:

```bash
pnpm exec vitest run apps/web/components/administration apps/web/lib/administration testing/administration-workbench --coverage --coverage.include='apps/web/components/administration/**'
```

## Notes

- Remaining uncovered branches are secondary empty/select fallbacks in catalogue detail panels.
- Router module is at 100% lines/functions.
- Track residual branch gaps in APZADMIN-005 certification if needed — no new product functionality.
