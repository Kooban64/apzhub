# SPR-OPS-N8N-002 — Workflow n8n health honesty

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-N8N-001](./SPR-OPS-N8N-001-workflow-n8n-adapter-host.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Touch legacy n8n containers · unlock execute · Authentik · Cap reopen

## Outcome

When the n8n engine adapter is connected, platform Workflow health/capabilities report **`engineConfigured: true`** and **`capabilities.n8n: true`**, while **`executionEnabled` stays false**. Runtime health uses the n8n ops provider (not `workflow-mock`).

## Ships

| ID  | Ship                                        | Landed                                                 |
| --- | ------------------------------------------- | ------------------------------------------------------ |
| H1  | Management plane DTO reads engine readiness | `buildWorkflowManagementPlaneDto` + workflows handlers |
| H2  | Bootstrap wires n8n ops when engine present | `createN8nWorkflowOpsProvider(engine.adapter)`         |
| H3  | Client maps honesty flags                   | `workflow-client` / `workflow-types`                   |

## Acceptance

1. With engine off: `engineConfigured` / `n8n` remain false.
2. With engine on: both true; `executionEnabled` / `capabilities.execution` remain false.
3. `GET /api/v1/workflow/health` reports provider `n8n` when engine connected.
4. Legacy host engines and Authentik untouched.
