# APZHUB n8n Mapping Guide

Raw n8n REST records stay private (`internal/n8n-api-types.ts`). Public outputs are adapter-local canonical metadata under `models/canonical.ts`.

| n8n source             | Canonical type                      | Notes                                                |
| ---------------------- | ----------------------------------- | ---------------------------------------------------- |
| Workflow               | `CanonicalWorkflowMetadata`         | node/connection counts; tags; no node config secrets |
| Workflow (as template) | `CanonicalWorkflowTemplateMetadata` | Partial — derived when template API absent           |
| Credential             | `CanonicalCredentialMetadata`       | `secretsIncluded: false` always                      |
| Variable               | `CanonicalVariableMetadata`         | `valueIncluded: false` always                        |
| Execution              | `CanonicalExecutionMetadata`        | `payloadIncluded: false` always                      |
| Tag / User / Project   | matching metadata types             | Users/projects edition-dependent                     |

Correspondence to frozen Workflow Platform contracts is conceptual only in APZWORKFLOW-006 — Platform Services integration is APZWORKFLOW-007+.
