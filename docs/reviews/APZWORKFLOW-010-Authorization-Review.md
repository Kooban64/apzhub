# APZWORKFLOW-010 — Authorization Review

**Result:** PASS

## Catalogue

`workflow.engine.read` · `workflow.engine.health` · `workflow.engine.diagnostics` · `workflow.engine.capabilities` (+ wildcard `workflow.engine.*`).

Mapped via `workflowEngineOps` in Production Authorization operation map.

## Enforcement path

Every `gateway.workflow.engine.*` public op is wrapped by RequestPipeline → Production Authorization before Platform Service / adapter call. No allow-all.

## Test evidence (existing suite)

| Scenario | Evidence |
| --- | --- |
| Anonymous denied | Production Authorization provider + policies (anonymous / invalid actor) |
| Missing permission denied | `hasWorkflowEnginePermission` + operation map unit tests (APZWORKFLOW-007) |
| Authorised allowed | Pipeline-wrapped gateway facet tests with `workflow.engine.*` context |
| Tenant / org isolation | Platform ServiceContext tenant/org fields enforced by Production Authorization access resolver (shared platform path — not bypassed for engine) |
| UI hide ≠ authz | Workbench `canValidateConnection` / `canView*` are presentation hints; server remains authoritative |

## Gaps (non-defects)

Live multi-tenant n8n isolation depends on provider config when engine is enabled — out of scope for read-only certification without live provider.
