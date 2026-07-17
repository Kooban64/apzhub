# APZWORKFLOW-010 — HTTP Certification

**Result:** PASS

## Surface

Authenticated GET routes under `/api/v1/workflows/engine/*`:

- workflows (list/detail)
- templates (list/detail)
- tags, users, projects
- capabilities, health, diagnostics, compatibility
- validate

Every route uses `withPlatformApiAuth` and wires `handlers/workflow-engine`.

## OpenAPI

Tag **Workflow Engine** in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` (Platform API **1.3.0**).  
`pnpm openapi:validate:platform` — PASS.

## Absences

No `/workflows/engine/{execute,runs,schedules,activate,deactivate,webhooks,credentials,workers,queues}` in filesystem or OpenAPI.

## Error / security envelope

Platform response envelope; provider/stack details not leaked to clients (`WorkflowEngineClientError` mapping).
