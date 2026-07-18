# APZWORKFLOW-005 — Security Review

**Scope:** Workflow management plane  
**Result:** PASS with documented management-plane limitations

## Verified controls

| Control                               | Evidence                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| Trusted session context               | `withPlatformApiAuth` on `/api/v1/workflows/*`                               |
| Production authorisation              | `workflowPlatformOps` → `PLATFORM_WORKFLOW_PERMISSIONS`                      |
| Deny-by-default                       | Missing permission fails before service call (platform-services tests)       |
| Tenant / org isolation                | Persistence RLS migrations 0044/0045; service context propagation            |
| Input validation                      | Zod / platform API schemas on handlers                                       |
| No script/expression execution        | Core + UI audits forbid `eval` / designer / runtime engines                  |
| No secrets in export                  | Metadata export JSON/YAML/Markdown only                                      |
| No browser persistence of definitions | Workbench has no localStorage/offline definition store                       |
| Controlled errors                     | PlatformServiceError / WorkflowClientError — no SQL/stack leakage to clients |
| No allow-all production fallback      | `APZHUB_WORKFLOW_ENABLED` + production factories require Postgres            |

## Authz matrix (minimum)

Anonymous / inactive / missing permission → denied. Correct permission → succeeds. Cross-tenant / org mismatch → denied. UI `canPublish` gating is presentation-only; server remains authoritative.

## Explicit non-goals

Runtime credentials, execution logs, webhook ingress, and engine connections are absent by design — not security defects for the management plane.
