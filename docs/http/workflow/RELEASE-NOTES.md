# Workflow HTTP API — Release Notes

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005  
> **Date:** 2026-07-19

## Added

- Versioned HTTP surface `/api/v1/workflow/*` (Owner endpoint set).
- OpenAPI **1.12.0** paths, schemas, permission annotations, and error status mappings.
- Gateway bootstrap: `APZHUB_WORKFLOW_ENABLED` with workflow readiness snapshot for HTTP readiness.
- Handlers call **only** `gateway.workflow.*` — AuthZ via Platform Authorization + Request Pipeline.

## Contracts / services (supporting)

- `@apzhub/workflow-contracts` **0.4.2** — `NotificationService.listIntents`.
- `@apzhub/platform-services` **0.28.0** — matching implementation + operation authorization map entry.

## Not included

Workflow Workbench · commercial APZ Workflow product · n8n provider unlock.
