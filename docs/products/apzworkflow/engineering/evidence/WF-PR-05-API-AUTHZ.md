# WF-PR-05 — API authz sweep

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-PR-05**     |
| Status | **Closed**       |
| Date   | 20260808T133000Z |

## Changes

1. `requireWorkflowPermission` — fail-closed session gate for Workflow permissions.
2. Business-process handlers — read requires `workflow.view|admin|manage`; write requires `manage|admin|create|update`.
3. Projects-Workflow bridge handlers — read `projects.view|manage|admin`; write `projects.manage|admin`.
4. Existing Workflow runtime plane continues gateway authz (`PERMISSION_DENIED` when production authz denies) — covered by `platform-api.workflow.v1.test.ts`.
5. All `/api/v1/workflow/*` routes use `withPlatformApiAuth` (24 routes).

## Tests

- `apps/web/lib/api/v1/handlers/require-workflow-permission.test.ts` — **PASS**
- Existing deny-runs test in `platform-api.workflow.v1.test.ts`
