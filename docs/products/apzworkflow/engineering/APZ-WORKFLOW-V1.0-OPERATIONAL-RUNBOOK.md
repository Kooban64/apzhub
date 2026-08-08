# APZ Workflow Version 1.0 — Operational Runbook

| Field     | Value                                       |
| --------- | ------------------------------------------- |
| Timestamp | 20260808T133000Z                            |
| Audience  | Operators · Administrators                  |
| Target    | APZ Workflow Version 1.0 – Production Ready |
| Inventory | WF-PR-06                                    |

---

## 1. Feature flags

| Flag                                    | Meaning                                                               |
| --------------------------------------- | --------------------------------------------------------------------- |
| `APZHUB_WORKFLOW_ENABLED=true`          | Enables Workflow HTTP + workbench bootstrap                           |
| `DATABASE_URL`                          | **Required** when Workflow enabled — Postgres SoR                     |
| `APZHUB_BUSINESS_PROCESS_STORE`         | Omit / `postgres` in production; `memory` **forbidden** in production |
| `APZHUB_PROJECTS_WORKFLOW_BRIDGE_STORE` | Same posture as business-process store                                |
| Provider execute                        | **Gated** — `providerExecuteSupported=false` for V1.0                 |

## 2. Deployment verification

1. Host coexistence: APZHUB Postgres **54334**, Redis, web, Caddy — see `ENVIRONMENT.md`.
2. Migrations: `set -a && . ./.env && set +a && pnpm db:migrate` (repeat with `DATABASE_URL=$DATABASE_URL_TEST` for test DB).
3. Confirm tables exist: `platform_workflow*`, `platform_business_*`, `apz_platform_projects_approval_binding`.
4. Health: `GET /api/health` healthy; Workflow readiness `GET /api/v1/workflow/readiness` → `ready_with_limitations` with execute gated.

## 3. Product surfaces

| Surface                | Route                                          |
| ---------------------- | ---------------------------------------------- |
| Product home           | `/workspace/workflow`                          |
| Journeys               | `/workspace/workflow/journeys`                 |
| Templates / monitoring | `/workspace/workflow/templates`, `/monitoring` |
| Operator tools         | sidebar under Workflow (`workflow.admin`)      |
| Process library        | sidebar under Workflow                         |

## 4. Known production limitations (honest)

- Provider execute **not** enabled — Start run returns 409 / UI gated.
- Projects approval bridge may report **Approvals unavailable** when Workflow executor is not injected — fail closed, not silent success.
- n8n remains CERTIFIED_FOUNDATION read-only.

## 5. Backup / restore

- Platform Postgres includes Workflow + business-process + bridge bindings.
- Follow `docs/operations/BACKUP-AND-RECOVERY.md`.

## 6. Diagnosis

| Symptom                           | Check                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------- |
| 503 PERSISTENCE_UNAVAILABLE       | `DATABASE_URL`, Postgres up, migrations applied                               |
| 403 FORBIDDEN on journeys         | Session lacks `workflow.view` / manage grants                                 |
| Approvals unavailable on Projects | Bridge executor not injected / execute gated — expected until separate unlock |
| Start run visible                 | Bug — should be hidden when execute unsupported                               |

## 7. Permissions (minimum)

| Persona            | Grants                                     |
| ------------------ | ------------------------------------------ |
| Business user      | `workflow.view`                            |
| Steward / designer | `workflow.manage` (or create/update)       |
| Operator           | `workflow.admin` (+ engine read as needed) |
