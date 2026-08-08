# WF-H5 — Operational hardening

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-H5**        |
| Status | **Closed**       |
| Date   | 20260808T151500Z |

## Runbook

[APZ-WORKFLOW-V1.0-OPERATIONAL-RUNBOOK.md](../APZ-WORKFLOW-V1.0-OPERATIONAL-RUNBOOK.md)

## Exercised checks (20260808)

| Check                                                           | Result          |
| --------------------------------------------------------------- | --------------- |
| Migrations apply (`pnpm db:migrate` + test DB)                  | PASS — WF-PR-03 |
| Workflow / business-process / bridge tables present             | PASS            |
| Feature flags + execute gated posture documented                | PASS            |
| Diagnosis table (503 / 403 / approvals unavailable / Start run) | Documented      |
| Backup pointer to platform Postgres ops                         | Documented      |

Ops can start/stop/diagnose from the runbook alone for V1.0 scope.
