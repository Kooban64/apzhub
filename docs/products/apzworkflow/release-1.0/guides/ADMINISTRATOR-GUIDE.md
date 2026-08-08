# APZ Workflow Version 1.0 — Administrator Guide

## Enablement

1. Ensure platform Postgres is available (`DATABASE_URL`).
2. Apply migrations.
3. Set `APZHUB_WORKFLOW_ENABLED=true`.
4. Do **not** set `APZHUB_BUSINESS_PROCESS_STORE=memory` in production.

## Permissions

| Grant                               | Use                                                   |
| ----------------------------------- | ----------------------------------------------------- |
| `workflow.view`                     | View journeys, templates, monitoring                  |
| `workflow.manage` / create / update | Design and govern journeys                            |
| `workflow.admin`                    | Operator tools (health, capabilities, engine sidebar) |

## Boundary

Provider execute remains gated for Version 1.0. Do not enable execute without separate Owner Auth.

## Projects bridge

Approval bindings live in `apz_platform_projects_approval_binding`. If the Workflow executor is not injected, Projects surfaces show approvals unavailable — expected fail-closed behaviour.
