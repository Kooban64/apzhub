# APZHUB Platform Workflow Typed Client Guide

**Milestone:** APZWORKFLOW-003  
**Location:** `apps/web/lib/workflows/`

## Factory

```ts
import { createHttpWorkflowClient } from "@/lib/workflows/workflow-api";

const client = createHttpWorkflowClient();
const workflows = await client.listWorkflows({ lifecycle: "draft" });
```

## Modules

| File | Role |
|------|------|
| `workflow-client.ts` | `createHttpWorkflowClient` — fetch `/api/v1/workflows` only |
| `mock-workflow-client.ts` | In-memory mock for tests |
| `workflow-api.ts` | Module accessor + facade helpers |
| `workflow-types.ts` | View models / inputs |
| `workflow-errors.ts` | `WorkflowClientError` |
| `routes.ts` | Path helpers + forbidden segments |
| `query-keys.ts` | TanStack Query keys |

## Constraints

- No `@apzhub/platform-services`, workflow-core, or persistence imports
- No execute / n8n / schedule client methods
- Path guard rejects non-`/api/v1/workflows` URLs and forbidden segments

## Facades

`listWorkflows`, `getWorkflow`, `createWorkflow`, `publishWorkflow`, `validateWorkflow`, `getWorkflowCapabilities`, etc. — see `workflow-api.ts`.
