# n8n Integration — Capability Assessment

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Package:** `@apzhub/integration-n8n` **0.1.0**

| Capability                         | Status              | Notes                                             |
| ---------------------------------- | ------------------- | ------------------------------------------------- |
| Health                             | **Implemented**     | SDK health checks + operational classification    |
| Diagnostics                        | **Implemented**     | Masked diagnostics extension + snapshot           |
| Version detection                  | **Implemented**     | Response headers → healthz → API capability hint  |
| Capability detection               | **Implemented**     | Static extended caps + runtime reachability probe |
| Authentication bridge              | **Implemented**     | SecretProvider refs; no secrets in logs           |
| Error translation                  | **Implemented**     | `N8nVendorErrorMapper`                            |
| Metrics / structured logging       | **Implemented**     | Via IntegrationAdapterBase                        |
| Workflows metadata                 | **Implemented**     | List/get → canonical Workflow metadata            |
| Templates metadata                 | **Partial**         | Workflow-as-template metadata mapping             |
| Credentials metadata               | **Implemented**     | Names/types only — no secrets                     |
| Variables metadata                 | **Implemented**     | Keys only — no values                             |
| Executions metadata                | **Implemented**     | Status/timings only — no payloads                 |
| Tags / users / projects            | **Implemented**     | Edition-dependent → NOT_SUPPORTED when absent     |
| Provider / capability registration | **Implemented**     | Factory + in-memory capability registration       |
| Mock provider                      | **Implemented**     | `createMockN8nFetch`                              |
| Execute / schedule / mutate        | **Not implemented** | Foundation non-goal · freeze                      |

## Information Model alignment

Canonical adapter models map to Workflow / WorkflowTemplate / WorkflowCredential / WorkflowVariable / WorkflowRun metadata concepts per [WORKFLOW-INFORMATION-MODEL](../../platform/workflow/WORKFLOW-INFORMATION-MODEL.md). Provider DTOs remain internal.
