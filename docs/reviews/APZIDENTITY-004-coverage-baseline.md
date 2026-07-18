# APZIDENTITY-004 Coverage Baseline

**Date:** 2026-07-17
**Scope:** `apps/web/components/identity/**`, `apps/web/lib/identity/**`

## Result

| Metric             | Workbench components + lib |
| ------------------ | -------------------------- |
| Lines / Statements | **98.5%** (4417 / 4484)    |
| Branches           | **76.8%** (789 / 1028)     |
| Functions          | **98.5%** (385 / 391)      |

Measured via:

```bash
pnpm exec vitest run apps/web/components/identity apps/web/lib/identity testing/identity-workbench \
  --coverage \
  --coverage.include='apps/web/components/identity/**' \
  --coverage.include='apps/web/lib/identity/**'
```

## Target assessment

| Target (APZIDENTITY-004 brief) | Result                                                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 95%+ lines                     | **Met** (98.5%)                                                                                                                                                |
| 95%+ functions                 | **Met** (98.5%)                                                                                                                                                |
| Meaningful branch coverage     | **Met** — primary create/update/detail/error/unavailable/forbidden/retry paths exercised; residual branches are optional-field / ternary presentation variants |

## Breakdown

| File                            | Lines   | Notes                                                                                        |
| ------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `identity-workspace-router.tsx` | 100%    | Fully covered                                                                                |
| `platform-identity-view.tsx`    | ~96.9%  | All sixteen sections exercised; residual uncovered lines are optional presentation ternaries |
| `routes.ts`                     | 100%    | Fully covered                                                                                |
| `identity-client.ts`            | ~98.9%  | Production HTTP client                                                                       |
| `identity-errors.ts`            | 100%    | Fully covered                                                                                |
| `query-keys.ts`                 | ~91.6%+ | List/detail builders + `clearIdentityQueries` exercised                                      |
| `identity-api.ts`               | ~94%+   | Facades including activation/deactivation/audit/history detail                               |
| `mock-identity-client.ts`       | ~98%    | CRUD + activation/audit/history facades exercised                                            |
| `identity-types.ts`             | 0%      | Pure type declarations — no executable statements to instrument                              |

## Notes

- Scoped Workbench coverage only; Identity HTTP handlers remain under APZIDENTITY-003; core/platform-services under APZIDENTITY-001/002.
- Global Vitest branch threshold (80%) may warn on this scoped include set because optional UI ternaries dominate remaining branch gaps; milestone DoD uses the Identity Workbench targets above, not the monorepo-wide default.
- Residual optional UI branches may be hardened in **APZIDENTITY-005** if certification evidence requires it — no new product functionality.
