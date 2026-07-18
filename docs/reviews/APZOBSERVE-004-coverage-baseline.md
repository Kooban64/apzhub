# APZOBSERVE-004 — Coverage Baseline

**Milestone:** APZOBSERVE-004 — Observability Administration Workbench  
**Date:** 2026-07-17

## Scope

- `apps/web/components/observe/**`
- Related route helpers exercised via `apps/web/lib/observe/routes.test.ts` and `testing/observe-workbench/**` (included in run; coverage include scoped to components)

## Command

```bash
pnpm exec vitest run \
  apps/web/components/observe \
  apps/web/lib/observe/routes.test.ts \
  testing/observe-workbench \
  --coverage \
  --coverage.include='apps/web/components/observe/**'
```

## Result (APZOBSERVE-004 closeout)

| Metric             | Result                   |
| ------------------ | ------------------------ |
| Lines / Statements | **99.65%** (1139 / 1143) |
| Functions          | **100%** (50 / 50)       |
| Branches           | **95.55%** (215 / 225)   |
| Workspace router   | **100%** all metrics     |

## Notes

- Remaining uncovered lines are secondary empty/description branches inside `PageShell` / `ErrorState` / empty detail and a timing-sensitive diagnostics “Loading” branch.
- Critical paths covered: unavailable/retry, forbidden/not-found, validation/conflict mutations, capability banners, keyboard row selection, facet create/update.
