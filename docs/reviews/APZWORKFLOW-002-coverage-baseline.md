# APZWORKFLOW-002 Coverage Baseline

**Date:** 2026-07-15  
**Scope:** `packages/platform-services/src/services/workflow/**` (primary)  
**Target:** ≥95% lines / functions on new workflow services code  
**Result:** **PASS**

---

## Scoped baseline (workflow services)

```bash
pnpm exec vitest run --coverage --config vitest.config.ts \
  packages/platform-services/src/services/workflow
```

| File | Lines | Functions | Branches |
| --- | ---: | ---: | ---: |
| `create-workflow-platform-services.ts` | 100% | 100% | — |
| `workflow-service-impls.ts` | 100% | 100% | — |
| `workflow-env.ts` | 100% | 100% | — |
| **Directory total** | **100%** (357/357) | **100%** (42/42) | — |

Overall `@apzhub/platform-services` package coverage remains lower than this scoped directory when measured with repo-wide thresholds — that is expected. Gate for APZWORKFLOW-002 is the scoped workflow services directory.

## Supporting packages

| Package | Notes |
| --- | --- |
| `@apzhub/workflow-contracts` | Gateway types + `workflow.validation` permission |
| `@apzhub/workflow-core` | `createPlatformWorkflowService` domain coverage |
| `@apzhub/workflow-persistence` | `createWorkflowPersistenceForTest` helper |
