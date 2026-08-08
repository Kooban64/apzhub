# APZ Workflow Version 1.0 — Operations Guide

Canonical runbook: [../../engineering/APZ-WORKFLOW-V1.0-OPERATIONAL-RUNBOOK.md](../../engineering/APZ-WORKFLOW-V1.0-OPERATIONAL-RUNBOOK.md)

## Quick checks

| Check                            | Expect                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /api/health`                | healthy                                                                               |
| `GET /api/v1/workflow/readiness` | `ready_with_limitations`, execute gated                                               |
| Tables                           | `platform_workflow*`, `platform_business_*`, `apz_platform_projects_approval_binding` |

## Common faults

| Symptom                           | Action                                           |
| --------------------------------- | ------------------------------------------------ |
| 503 PERSISTENCE_UNAVAILABLE       | Postgres / `DATABASE_URL` / migrations           |
| 403 on journeys                   | Missing `workflow.view` (or manage)              |
| Approvals unavailable in Projects | Executor not injected / execute gated — expected |
| Start run button visible          | Defect — should be gated; raise hotfix           |

## Backup

Workflow SoR is in platform Postgres — follow platform backup/restore drills.
