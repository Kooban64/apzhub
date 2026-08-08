# WF-H4 — Security residual (authz + tenant binding)

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-H4**        |
| Status | **Closed**       |
| Date   | 20260808T151500Z |

## Complements WF-PR-05

| Control                   | Evidence                                                       |
| ------------------------- | -------------------------------------------------------------- |
| Session permission gate   | `requireWorkflowPermission` — 403 FORBIDDEN when missing       |
| Business-process handlers | Read/write permission checks wired                             |
| Projects–Workflow bridge  | `projects.view                                                 | manage | admin` gates |
| Workflow runtime deny     | `platform-api.workflow.v1.test.ts` production authz deny       |
| Tenant membership         | `workflowSessionTenantId` rejects empty tenant                 |
| Execute surface           | 409 when provider execute unsupported (no half-open execute)   |
| Auth wrapper              | All `/api/v1/workflow/*` routes use `withPlatformApiAuth` (24) |

## Tests

- `apps/web/lib/api/v1/handlers/require-workflow-permission.test.ts`
- `apps/web/lib/api/v1/platform-api.workflow.v1.test.ts` (deny + execute gate)

**No Critical / High open** for V1.0 Production Ready scope.
