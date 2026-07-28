# Workflow Workbench Module

> **Programme:** APZHUB-PLATFORM-WORKFLOW-006 — **ACCEPTED / CLOSED**  
> **Surface:** `/workspace/workflow/*`  
> **HTTP dependency:** `/api/v1/workflow/*` (OpenAPI **1.12.0**)  
> **Recommendation:** **WORKBENCH READY**

## Documents

| Document                | Path                                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Developer Guide         | [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)                                                                                                                                                         |
| Navigation              | [NAVIGATION.md](./NAVIGATION.md)                                                                                                                                                                   |
| Compatibility Statement | [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                                                                                                                                         |
| Known Limitations       | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                                                                                                                                                     |
| Release Notes           | [RELEASE-NOTES.md](./RELEASE-NOTES.md)                                                                                                                                                             |
| Completion Report       | [../../sprint/APZHUB-PLATFORM-WORKFLOW-006-completion-report.md](../../sprint/APZHUB-PLATFORM-WORKFLOW-006-completion-report.md)                                                                   |
| Acceptance Report       | [../../foundation/completion-reports/APZHUB-PLATFORM-WORKFLOW-006-programme-acceptance-report.md](../../foundation/completion-reports/APZHUB-PLATFORM-WORKFLOW-006-programme-acceptance-report.md) |

## Architecture

```
Workbench shell → /workspace/workflow/* → WorkflowWorkspaceRouter
  → typed client (/api/v1/workflow/*) → Workflow HTTP API → gateway.workflow.*
```

No direct n8n / platform-services / engine client imports in the Workbench UI.

**Distinct surfaces:**

| Path                           | Role                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `/workspace/workflow/*`        | Canonical Workflow Platform Workbench (this programme) |
| `/workspace/workflows/*`       | Legacy Workflow SoR metadata workbench                 |
| `/workspace/workflow-engine/*` | Workflow Engine workbench                              |

## Views

| View              | Route                                  |
| ----------------- | -------------------------------------- |
| Workflow Home     | `/workspace/workflow`                  |
| Definitions       | `/workspace/workflow/definitions`      |
| Definition Detail | `/workspace/workflow/definitions/{id}` |
| Runs              | `/workspace/workflow/runs`             |
| Run Detail        | `/workspace/workflow/runs/{id}`        |
| Schedules         | `/workspace/workflow/schedules`        |
| Schedule Detail   | `/workspace/workflow/schedules/{id}`   |
| Tasks             | `/workspace/workflow/tasks`            |
| Task Detail       | `/workspace/workflow/tasks/{id}`       |
| Approvals         | `/workspace/workflow/approvals`        |
| Approval Detail   | `/workspace/workflow/approvals/{id}`   |
| Notifications     | `/workspace/workflow/notifications`    |
| Health            | `/workspace/workflow/health`           |
| Diagnostics       | `/workspace/workflow/diagnostics`      |
| Capability Viewer | `/workspace/workflow/capabilities`     |
| Search Results    | `/workspace/workflow/search`           |

## Explicit non-deliverables

Commercial APZ Workflow product features beyond Release 1.0 · designer · AI orchestration · provider DTO leakage
