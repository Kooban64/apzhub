# APZHUB Workflow Workbench Developer Guide

**Milestone:** APZWORKFLOW-004

## Consume only

```ts
import {
  listWorkflows,
  getWorkflow,
  workflowQueryKeys,
} from "@/lib/workflows/workflow-api";
```

Never import `@apzhub/platform-services`, `@apzhub/workflow-core`, `@apzhub/workflow-persistence`, or call `/api/v1` with raw `fetch` from workbench components.

## Layout

| Path                                                          | Role                               |
| ------------------------------------------------------------- | ---------------------------------- |
| `apps/web/components/workflows/`                              | Presentation                       |
| `apps/web/lib/workflows/`                                     | Typed client + routes + query keys |
| `packages/workbench-framework/manifests/platform-workflows*/` | Navigation manifests               |

## Shell mount

`WorkbenchPage` mounts `WorkflowsWorkspaceRouter` when `isWorkflowsRoute(pathname)`.

## Tests & audit

```bash
pnpm exec vitest run apps/web/components/workflows apps/web/lib/workflows
pnpm audit:workflow-workbench
```

Playwright: `testing/playwright/e2e/apzworkflow-004-platform-workflows-workbench.spec.ts` (mock `**/api/v1/workflows**`).

## Out of scope

Designer, drag-drop, execution, n8n, Event Bus, workers, schedules, Meilisearch, offline persistence.
