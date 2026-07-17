# Workflow Engine Typed Client Guide

**APZWORKFLOW-008**

## Factory

```ts
import { createHttpWorkflowEngineClient } from "@/lib/workflows/engine-client";
import { createMockWorkflowEngineClient } from "@/lib/workflows/mock-engine-client";

const client =
  process.env.NODE_ENV === "test"
    ? createMockWorkflowEngineClient()
    : createHttpWorkflowEngineClient();
```

Module accessor: `getWorkflowEngineClient()` / `setWorkflowEngineClient()` in `engine-api.ts` (mock selected automatically when `NODE_ENV=test`).

## Methods

`listWorkflows` · `getWorkflow` · `listTemplates` · `getTemplate` · `listTags` · `listUsers` · `listProjects` · `capabilities` · `health` · `diagnostics` · `compatibility` · `validate`

Calls **only** `/api/v1/workflows/engine/*`.

## Errors

Failures become `WorkflowEngineClientError` (canonical). Use `toWorkflowEngineUserMessage()` for UI copy. Never surface REST exceptions or stack traces.
