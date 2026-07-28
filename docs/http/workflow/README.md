# Canonical Workflow HTTP API

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005 — **ACCEPTED / CLOSED**  
> **Surface:** `/api/v1/workflow/*`  
> **OpenAPI:** [APZHUB-Platform-OpenAPI-v1.yaml](../../specs/APZHUB-Platform-OpenAPI-v1.yaml) **1.12.0**  
> **Recommendation:** **HTTP API READY**

## Documents

| Document                | Path                                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP API Certification  | [HTTP-API-CERTIFICATION.md](./HTTP-API-CERTIFICATION.md)                                                                                                                                           |
| Compatibility Statement | [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                                                                                                                                         |
| Quality Evidence        | [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)                                                                                                                                                       |
| Known Limitations       | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                                                                                                                                                     |
| Release Notes           | [RELEASE-NOTES.md](./RELEASE-NOTES.md)                                                                                                                                                             |
| Completion Report       | [../../sprint/APZHUB-PLATFORM-WORKFLOW-005-completion-report.md](../../sprint/APZHUB-PLATFORM-WORKFLOW-005-completion-report.md)                                                                   |
| Acceptance Report       | [../../foundation/completion-reports/APZHUB-PLATFORM-WORKFLOW-005-programme-acceptance-report.md](../../foundation/completion-reports/APZHUB-PLATFORM-WORKFLOW-005-programme-acceptance-report.md) |

## Architecture

```
Client → /api/v1/workflow/* → withPlatformApiAuth → gateway.workflow.*
  → Workflow Platform Services → provider-neutral ops (n8n only via Integration SDK at bootstrap)
```

No direct n8n / provider DTO access from HTTP handlers.

**Distinct surfaces (no collision):**

| Path                         | Role                                              |
| ---------------------------- | ------------------------------------------------- |
| `/api/v1/workflow/*`         | Canonical Workflow Platform HTTP (this programme) |
| `/api/v1/workflows/*`        | Legacy Workflow SoR / management plane            |
| `/api/v1/workflows/engine/*` | Workflow Engine adapter surface                   |

## Endpoints

| Method | Path                                          | Permission (catalogue)                             |
| ------ | --------------------------------------------- | -------------------------------------------------- |
| GET    | `/api/v1/workflow/health`                     | `workflow.engine.health`                           |
| GET    | `/api/v1/workflow/readiness`                  | `workflow.view`                                    |
| GET    | `/api/v1/workflow/capabilities`               | `workflow.engine.capabilities`                     |
| GET    | `/api/v1/workflow/definitions`                | `workflow.view`                                    |
| GET    | `/api/v1/workflow/definitions/{definitionId}` | `workflow.view`                                    |
| GET    | `/api/v1/workflow/runs`                       | `workflow.runs.view`                               |
| GET    | `/api/v1/workflow/runs/{runId}`               | `workflow.runs.view`                               |
| POST   | `/api/v1/workflow/runs`                       | `workflow.runs.start`                              |
| POST   | `/api/v1/workflow/runs/{runId}/cancel`        | `workflow.runs.cancel`                             |
| GET    | `/api/v1/workflow/schedules`                  | `workflow.schedules.view`                          |
| POST   | `/api/v1/workflow/schedules`                  | `workflow.schedules.manage`                        |
| PATCH  | `/api/v1/workflow/schedules/{scheduleId}`     | `workflow.schedules.manage`                        |
| DELETE | `/api/v1/workflow/schedules/{scheduleId}`     | `workflow.schedules.manage`                        |
| GET    | `/api/v1/workflow/tasks`                      | `workflow.tasks.view`                              |
| GET    | `/api/v1/workflow/tasks/{taskId}`             | `workflow.tasks.view`                              |
| PATCH  | `/api/v1/workflow/tasks/{taskId}`             | `workflow.tasks.claim` / `workflow.tasks.complete` |
| GET    | `/api/v1/workflow/approvals`                  | `workflow.tasks.view`                              |
| PATCH  | `/api/v1/workflow/approvals/{approvalId}`     | `workflow.tasks.approve`                           |
| GET    | `/api/v1/workflow/notifications`              | `workflow.runs.view`                               |

## Enablement

- `APZHUB_WORKFLOW_ENABLED=true`
- Controlled **503** `WORKFLOW_SERVICE_UNAVAILABLE` when disabled

## Explicit non-deliverables

Workflow Workbench · commercial APZ Workflow product · provider DTO leakage · n8n unlock beyond CERTIFIED_FOUNDATION
