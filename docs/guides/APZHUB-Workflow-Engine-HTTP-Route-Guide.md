# Workflow Engine HTTP Route Guide

**APZWORKFLOW-008**

Base: `/api/v1/workflows/engine`

All routes:

- `withPlatformApiAuth`
- handlers in `apps/web/lib/api/v1/handlers/workflow-engine.ts`
- call `gateway.workflow.engine.*` only

Forbidden under `/engine`: `execute`, `n8n`, `schedules`, `activate`, `deactivate`, `webhooks`, mutations.

Authz permissions (pipeline): `workflow.engine.read` · `health` · `diagnostics` · `capabilities` (and wildcards).
