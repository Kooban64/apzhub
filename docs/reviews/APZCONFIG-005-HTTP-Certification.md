# APZCONFIG-005 — HTTP Certification

**Date:** 2026-07-16  
**Surface:** `/api/v1/configuration/*` · OpenAPI **1.5.0**

## Certified properties

- Handlers call `getPlatformServiceGateway().configuration.*` exclusively
- RequestPipeline + Production Authorization via gateway operation map
- Standard API v1 response envelopes (`data` / `page` / `meta` / `error`)
- Trusted `ServiceRequestContext` from server session (no client-supplied roles/tenant)
- Tenant and organisation isolation enforced server-side
- OpenAPI parity for management-plane routes; runtime routes omitted
- Controlled `503` when `APZHUB_CONFIGURATION_ENABLED` is false

## Explicitly absent

`/resolve`, `/effective`, `/apply`, `/runtime`, `/secrets`, `/feature-flags`, `/env`, `/kubernetes`, `/events`, `/reload`

## Verdict

**PASS** — `pnpm audit:configuration-http-client` + `pnpm openapi:validate:platform`
