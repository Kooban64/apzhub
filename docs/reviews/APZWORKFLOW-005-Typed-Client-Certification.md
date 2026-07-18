# APZWORKFLOW-005 — Typed Client Certification

## Surface

- Production: `createHttpWorkflowClient()` in `apps/web/lib/workflows/workflow-client.ts`
- Mock: `createMockWorkflowClient()` for tests
- Facades / query keys: `workflow-api.ts`, `query-keys.ts`

## Verified

| Property                                              | Result                       |
| ----------------------------------------------------- | ---------------------------- |
| Calls only `/api/v1/workflows/*`                      | PASS                         |
| Envelope parsing + error translation                  | PASS (client + Vitest)       |
| AbortSignal / cancellation                            | Supported on request options |
| No server-only / gateway / core / persistence imports | PASS (audits)                |
| No execute / runs / n8n methods                       | PASS                         |
| Stable query keys (workflows, versions, templates, …) | PASS                         |
| Mock parity for Workbench tests                       | PASS                         |

No new client capability introduced during APZWORKFLOW-005.
