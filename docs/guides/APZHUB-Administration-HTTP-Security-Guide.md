# APZHUB Administration HTTP Security Guide

**Milestone:** APZADMIN-003

## Controls

- Every route uses `withPlatformApiAuth` + `runtime = "nodejs"`
- Handlers use `context.serviceContext` and call `gateway.administration.*` only
- Authorization is enforced in the Platform Services RequestPipeline (`admin.*` permissions)
- Zod validation on path/query/body before service calls
- Standard error envelope — no backend/engine details leaked
- Bootstrap deny-by-default: `APZHUB_ADMINISTRATION_ENABLED` must be explicitly enabled

## Explicit non-goals

No user/role/tenant management, no runtime admin, no live diagnostic probes, no Event Bus, no AI endpoints under this API.
