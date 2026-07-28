# Workflow HTTP API — Compatibility Statement

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005

| Component                    | Version / status | Notes                                          |
| ---------------------------- | ---------------- | ---------------------------------------------- |
| Platform OpenAPI             | **1.12.0**       | Additive `/workflow/*` paths (singular)        |
| `@apzhub/workflow-contracts` | **0.4.2**        | Additive `NotificationService.listIntents`     |
| `@apzhub/platform-services`  | **0.28.0**       | `gateway.workflow` runtime + listIntents AuthZ |
| `@apzhub/integration-n8n`    | **0.1.0**        | Bootstrap-only (handlers never import)         |
| Integration SDK              | **1.0.0**        | Frozen — unchanged                             |
| `/api/v1/workflows/*`        | Unchanged        | SoR / management plane — no route collision    |
| `/api/v1/workflows/engine/*` | Unchanged        | Engine surface — no route collision            |
| Workbench                    | Not delivered    | Out of WORKFLOW-005 scope                      |
| Commercial APZ Workflow      | Not delivered    | Out of scope                                   |

## Compatibility guarantees

- Provider-neutral JSON only — no n8n API keys, provider DTO fields, or engine branding in responses.
- Controlled **503** when `APZHUB_WORKFLOW_ENABLED` is false.
- Schedule DELETE maps to retire (soft lifecycle) — consistent with platform schedule semantics.
- Task PATCH supports `claim` / `complete`; approval PATCH supports `approved` / `rejected`.
