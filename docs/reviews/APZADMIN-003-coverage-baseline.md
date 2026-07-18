# APZADMIN-003 Coverage Baseline

**Date:** 2026-07-16  
**Target:** ≥95% lines/functions on `apps/web/lib/api/v1/handlers/administration.ts` and `apps/web/lib/administration/**`

## Measured (vitest + v8)

| Scope                        | Lines      | Functions |
| ---------------------------- | ---------- | --------- |
| All included files           | **99.17%** | **100%**  |
| `handlers/administration.ts` | **99.44%** | **100%**  |
| `lib/administration/*`       | **98.86%** | **100%**  |

## Suites

- `apps/web/lib/api/v1/handlers/administration.test.ts`
- `apps/web/lib/api/v1/handlers/administration.coverage.test.ts`
- `apps/web/lib/administration/*.test.ts`
- `testing/administration-http-client/apzadmin-003-http-client.test.ts`

## Command

```bash
pnpm exec vitest run apps/web/lib/administration apps/web/lib/api/v1/handlers/administration.test.ts apps/web/lib/api/v1/handlers/administration.coverage.test.ts testing/administration-http-client --coverage --coverage.include='apps/web/lib/administration/**' --coverage.include='apps/web/lib/api/v1/handlers/administration.ts'
```
