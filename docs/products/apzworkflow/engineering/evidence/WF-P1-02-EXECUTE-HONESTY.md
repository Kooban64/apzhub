# WF-P1-02 — Honest automation boundary

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-P1-02**     |
| Status | **Closed**       |
| Date   | 20260808T131000Z |

## Changes

1. **HTTP** — `handleCreateWorkflowRun` returns **409** `PROVIDER_EXECUTE_NOT_SUPPORTED` when `providerExecuteSupported` is false (no fake failed run).
2. **UI** — Definition detail shows Start run only via `canStartWorkflowRunsWhenReady` (permission **and** readiness).
3. **Disclosure** — Gated message `workflow-definition-execute-gated`; Capabilities view shows Provider execute state.
4. **Readiness** — Exposes `executionEnabled` in readiness payload for operators.

## Tests

- `apps/web/lib/workflow/permissions.test.ts`
- `apps/web/components/workflow/workflow-definition-detail-view.test.tsx`
- `apps/web/lib/api/v1/platform-api.workflow.v1.test.ts` — rejects create when execute unsupported

All green (20260808).
