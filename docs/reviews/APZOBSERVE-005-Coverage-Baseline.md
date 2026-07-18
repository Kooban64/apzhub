# APZOBSERVE-005 — Coverage Baseline

**Date:** 2026-07-17  
**Command:** `pnpm certify:observe-vertical` (scoped coverage stage)

## Include set

- `packages/observe-contracts/src/**`
- `packages/observe-core/src/**`
- `packages/observe-persistence/src/**`
- `packages/platform-services/src/services/observe/**`
- `apps/web/lib/observe/**`
- `apps/web/components/observe/**`
- `apps/web/lib/api/v1/handlers/observe.ts`
- `apps/web/lib/api/v1/schemas/observe.ts`

## Result (APZOBSERVE-005 closeout)

| Metric    | Result                                                                             |
| --------- | ---------------------------------------------------------------------------------- |
| Lines     | **98.22%**                                                                         |
| Functions | **96.97%**                                                                         |
| Branches  | **76.52%** (LIMITED residual — critical authz/disabled/lifecycle branches covered) |

Target lines/functions ≥95%: **PASS**. Branch residual documented in Known Limitations L-12.
