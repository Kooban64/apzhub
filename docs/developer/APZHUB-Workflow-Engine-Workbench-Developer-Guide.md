# Workflow Engine Workbench — Developer Guide

**Milestone:** APZWORKFLOW-009

## Consume only

```ts
import {
  listEngineWorkflows,
  getEngineWorkflow,
  /* … */,
  workflowEngineQueryKeys,
} from "@/lib/workflows/engine-api";
```

Runtime: `createHttpWorkflowEngineClient()`. Tests: `createMockWorkflowEngineClient()` via `setWorkflowEngineClient` / `NODE_ENV=test`.

## Layout

- `apps/web/components/workflow-engine/` — views, router, definition viewer
- `apps/web/lib/workflows/engine-*.ts` — client (APZWORKFLOW-008; reused)
- Manifests: `platform-workflow-engine*`

## Quality

```bash
pnpm audit:workflow-engine-workbench
pnpm exec vitest run apps/web/components/workflow-engine apps/web/lib/workflows/routes.test.ts
```

Playwright mock: `testing/playwright/e2e/apzworkflow-009-workflow-engine-workbench.spec.ts`
