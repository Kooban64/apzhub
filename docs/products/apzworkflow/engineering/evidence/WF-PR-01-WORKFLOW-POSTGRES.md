# WF-PR-01 — Workflow SoR Postgres production default

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-PR-01**     |
| Status | **Closed**       |
| Date   | 20260808T133000Z |

## Evidence

- Bootstrap `createWorkflowServicesBundle` requires `DATABASE_URL` and calls `createWorkflowPlatformServicesForProduction({ postgresDb: getDb() })`.
- Factory forbids in-memory fallback; `persistenceMode: "postgres"`.
- Source test: `apps/web/lib/api/v1/gateway/workflow-bootstrap-durability.test.ts` — **PASS**
- Live tables on `apzhub` / `apzhub_test`: `platform_workflow*` present (see WF-PR-03).
