# APZNOTIFY-001 Coverage Baseline

**Date:** 2026-07-14  
**Milestone:** Platform Notification Foundation  
**Target:** ≥95% lines · ≥95% functions · ≥80% branches (per package / combined)

---

## Measured (Vitest v8, scoped to `packages/notification-*`)

| Package | Lines | Functions | Branches | Statements |
| --- | ---: | ---: | ---: | ---: |
| `@apzhub/notification-contracts` | **100.00%** | **100.00%** | **100.00%** | **100.00%** |
| `@apzhub/notification-core` | **100.00%** | **100.00%** | **≥94%** | **100.00%** |
| `@apzhub/notification-persistence` | **≥97%** | **≥97%** | **≥80% overall** | **≥97%** |
| **Combined** | **99.11%** | **99.16%** | **80.80%** | **99.11%** |

Type-only contract modules (`common/`, `domain/`, `services/`) are excluded from coverage (no executable statements).

## Harness

- `testing/notification-foundation/apznotify-001-foundation.test.ts` — executes `pnpm audit:notification-foundation`
- Boundary tests forbid apps/HTTP/delivery providers/EventBus/queues/platform-services

## Audit

```bash
pnpm audit:notification-foundation
# RESULT: PASS (0 architecture/dependency/boundary/authorization violations)
```
