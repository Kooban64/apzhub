# APZ Workflow 1.0.0 — Operational Readiness

> **Programme:** APZ-WORKFLOW-002  
> **Date:** 2026-07-19

---

## Enablement

| Control      | Requirement                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Feature flag | `APZHUB_WORKFLOW_ENABLED=true`                                                                 |
| Provider     | n8n ops path as configured for CERTIFIED_FOUNDATION **or** mock/in-memory runtime for non-prod |
| Auth         | Better Auth session + Workflow permissions                                                     |
| Gateway      | Standard platform API pipeline (auth → authz → service → connector)                            |

## Health & diagnostics

- HTTP readiness/capabilities under `/api/v1/workflow/*`
- Workbench Health + Diagnostics + Capability Viewer (engine branding masked)
- n8n adapter health/diagnostics (CERTIFIED_FOUNDATION)

## Operations notes

1. Prefer n8n CE self-hosted for production provider path.
2. In-memory runtime registry is not an authoritative engine SoR — suitable for local/demo only.
3. Provider execute may report `ready_with_limitations` until a separate unlock programme.
4. Correlate requests via platform correlation IDs (010).
5. Do not expose n8n admin UI as the primary user surface.
6. Keep SoR (`/workspace/workflows`) and Engine (`/workspace/workflow-engine`) facets distinct from commercial `/workspace/workflow`.

## Related

- [n8n CERTIFICATION-REPORT](../../integrations/n8n/CERTIFICATION-REPORT.md)
- [Workflow HTTP](../../http/workflow/README.md)
- [Workbench](../../workbench/workflow/README.md)
