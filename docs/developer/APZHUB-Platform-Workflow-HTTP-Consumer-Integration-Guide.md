# APZHUB Platform Workflow HTTP Consumer Integration Guide

**Milestone:** APZWORKFLOW-003

## Preferred path

```text
Consumer UI / module
  → createHttpWorkflowClient() / workflow-api facades
  → /api/v1/workflows/*
  → PlatformServiceGateway.workflow.*
```

Do **not** import `@apzhub/platform-services` or workflow packages into presentation modules.

## Auth

Session cookie via `withPlatformApiAuth`. Server remains authoritative for `workflow.*` permissions.

## Errors

Envelope `{ error: { code, message }, meta }`. Typed client maps to `WorkflowClientError`. Disabled service → HTTP **503**.

## Enablement

Set `APZHUB_WORKFLOW_ENABLED=true` and provide `DATABASE_URL` for production bootstrap.
