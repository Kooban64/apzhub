# APZADMIN-005 — HTTP Review

**Date:** 2026-07-16  
**Surface:** `/api/v1/administration/*` · OpenAPI **1.6.0**

## Certified properties

- Handlers call `getPlatformServiceGateway().administration.*` exclusively
- RequestPipeline + Production Authorization via `administrationPlatformOps`
- Standard API v1 response envelopes (`data` / `page` / `meta` / `error`)
- Trusted `ServiceRequestContext` from server session (no client-supplied roles/tenant)
- Tenant and organisation isolation enforced server-side
- OpenAPI parity for management-plane routes; runtime/identity routes omitted
- Controlled disable path when Administration bootstrap flag is false

## Explicitly absent

`/execute`, `/runtime`, `/users`, `/roles`, `/tenants`, `/organisations`, `/organizations`, `/provisioning`, `/workbench`, `/probes`, `/events`, `/ai`

## Verdict

**PASS** — `pnpm audit:administration-http-client` + `pnpm openapi:validate:platform` + vertical audit route absence checks.
