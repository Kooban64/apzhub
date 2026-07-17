# APZWORKFLOW-001 Coverage Baseline

**Date:** 2026-07-15  
**Milestone:** Platform Workflow Foundation  
**Target:** ≥95% lines · ≥95% functions · ≥80% branches (per package)

---

## Measured (Vitest v8, scoped to `packages/workflow-*`)

| Package | Lines | Functions | Branches | Statements |
| --- | ---: | ---: | ---: | ---: |
| `@apzhub/workflow-contracts` | **100.00%** | **100.00%** | **100.00%** | **100.00%** |
| `@apzhub/workflow-core` | **99.60%** | **100.00%** | **96.40%** | **99.60%** |
| `@apzhub/workflow-persistence` | **99.06%** | **98.15%** | **80.74%** | **99.06%** |
| **Combined** | **99.37%** | **98.92%** | **89.05%** | **99.37%** |

Type-only contract modules (`common/`, `domain/`, `services/`) are excluded from coverage (no executable statements).

## Harness

- `testing/workflow-foundation/apzworkflow-001-foundation.test.ts` — executes `pnpm audit:workflow-foundation`
- Boundary tests forbid apps/HTTP/n8n/EventBus/meilisearch/queues

## Audit

```bash
pnpm audit:workflow-foundation
# RESULT: PASS (0 architecture/dependency/boundary/authorization violations)
```
