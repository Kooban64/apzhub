# APZ Workflow Version 1.0 — Release Notes

| Field   | Value                                                   |
| ------- | ------------------------------------------------------- |
| Version | **1.0.0**                                               |
| Class   | Production Ready candidate (business-process companion) |
| Date    | 20260808                                                |

## What ships

- Activity Bar product **APZ Workflow** (`/workspace/workflow`)
- Business journeys, templates, process monitoring, participants/approvals surfaces
- Durable Postgres SoR for workflow definitions + business-process metadata + Projects approval bindings
- Honest execute boundary — Start run unavailable; API returns 409 when provider execute unsupported
- Fail-closed persistence (no silent in-memory in production)
- Fail-closed session authz on business-process and Projects–Workflow bridge APIs
- Hardening evidence: journeys, accessibility, performance, security, ops runbook

## Known limitations (intentional)

- Provider execute / schedule workers **not** unlocked
- No additional engines (Temporal, Camunda, …)
- No visual designer-first UX
- Projects approvals may report **unavailable** when Workflow executor is not injected — fail closed

## Out of release

Execute unlock · new providers · designer redesign · architecture reopen

## Upgrade

1. Apply migrations (`pnpm db:migrate`)
2. Set `APZHUB_WORKFLOW_ENABLED=true` with `DATABASE_URL`
3. Assign `workflow.view` / `workflow.manage` / `workflow.admin` as appropriate
4. Follow [guides/OPERATIONS-GUIDE.md](./guides/OPERATIONS-GUIDE.md)
