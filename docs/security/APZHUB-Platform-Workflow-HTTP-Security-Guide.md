# APZHUB Platform Workflow HTTP Security Guide

**Milestone:** APZWORKFLOW-003

## Controls

- All routes wrapped with `withPlatformApiAuth`
- Authorization via existing `workflowPlatformOps` / `PLATFORM_WORKFLOW_PERMISSIONS`
- Zod validation on bodies/params/query before gateway calls
- Correlation / request IDs on envelope meta
- Rate limiting / traffic governance via shared platform API middleware
- Superadmin remains explicit permission tier — not a bypass

## Boundaries

- Handlers must not import workflow-core, persistence, drizzle, or postgres
- Typed client must not import platform-services
- No execution / n8n / schedule HTTP surfaces
- Management stubs advertise `executionEnabled: false` and `engineConfigured: false`

## Availability gate

When `APZHUB_WORKFLOW_ENABLED` is false, handlers throw controlled **503** (`WORKFLOW_SERVICE_UNAVAILABLE`) before gateway access.
