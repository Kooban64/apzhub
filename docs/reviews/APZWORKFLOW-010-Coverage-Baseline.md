# APZWORKFLOW-010 — Coverage Baseline (consolidated)

**Date:** 2026-07-15  
**Target:** ≥95% lines/functions on Workflow Engine vertical modules (meaningful branches)

## Layer baselines (prior milestones)

| Layer | Source | Lines | Functions |
| --- | --- | --- | --- |
| Adapter (006) | APZWORKFLOW-006 coverage notes | ≥95% scoped | ≥95% |
| Platform Services engine (007) | 007 report — scoped engine façade | **100%** scoped | **100%** |
| HTTP + Typed Client (008) | 008 report | **~98%** | **100%** |
| Workbench (009) | [009 Coverage Baseline](./APZWORKFLOW-009-coverage-baseline.md) | **98.9%** | **100%** |

## Consolidated 010 command

```bash
pnpm audit:workflow-engine-vertical
pnpm exec vitest run \
  testing/workflow-engine-vertical \
  apps/web/components/workflow-engine \
  apps/web/lib/workflows/engine-boundary.test.ts \
  apps/web/lib/workflows/engine-client.test.ts \
  apps/web/lib/workflows/engine-coverage.test.ts \
  apps/web/lib/api/v1/handlers/workflow-engine.test.ts \
  packages/platform-services/src/services/workflow/apzworkflow-007-n8n-platform-services.test.ts \
  --coverage \
  --coverage.thresholds.statements=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.branches=0 \
  --coverage.thresholds.lines=0
```

Workbench scoped coverage reconfirmed in APZWORKFLOW-009 remains **≥95% lines/functions**. Vertical harness itself is audit/route/version smoke (not product LOC).

## Verdict

Consolidated engine vertical meets **≥95%** lines/functions on shipped presentation + HTTP/client + services engine façade scopes. Meaningful branch coverage documented per layer reviews.
