# APZHUB Identity HTTP Security Guide

**Milestone:** APZIDENTITY-003

## Authentication of API callers

Every `/api/v1/identity/*` route uses `withPlatformApiAuth`. Session identity is mapped into a trusted `ServiceRequestContext` (tenant/user from session only).

## Authorization

Gateway operations are authorized via RequestPipeline + `identityPlatformOps` / `PLATFORM_IDENTITY_PERMISSIONS`. No client-side authorization.

## Data returned

Responses contain **canonical identity metadata only**.

Never expose:

- passwords or password hashes
- session / OAuth / refresh tokens
- MFA secrets
- API keys
- authentication cookies
- credential material

`authSubjectRef` may reference an Authentication subject — it must never contain credentials.

## Enablement

Disabled Identity (`APZHUB_IDENTITY_ENABLED` off) → HTTP **503** with `IDENTITY_SERVICE_UNAVAILABLE`.

## Boundaries

Handlers must not import identity-core, identity-persistence, Drizzle, or Postgres clients.
